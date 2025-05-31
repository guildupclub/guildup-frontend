export interface CallParticipant {
  id: string;
  email: string;
  name: string;
}

export interface CallData {
  id: string;
  caller: CallParticipant;
  callee: CallParticipant;
  type: 'voice';
  status: 'ringing' | 'connecting' | 'active' | 'ended';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private socket: any = null;
  private currentCallId: string | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private iceGatheringTimeout: NodeJS.Timeout | null = null;
  
  // Configuration for ICE servers (STUN servers for NAT traversal)
  private readonly rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
  };

  // Event handlers
  private onRemoteStreamHandler: ((stream: MediaStream) => void) | null = null;
  private onCallEndHandler: ((reason: string) => void) | null = null;
  private onConnectionStateChangeHandler: ((state: RTCPeerConnectionState) => void) | null = null;

  constructor(socket: any) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  // Initialize local audio stream
  async initializeLocalStream(): Promise<MediaStream> {
    try {
      if (this.localStream) {
        return this.localStream;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        },
        video: false
      });

      this.localStream = stream;
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw new Error('Failed to access microphone. Please check permissions.');
    }
  }

  // Create peer connection
  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection(this.rtcConfiguration);

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.currentCallId) {
        console.log('Generated ICE candidate:', {
          type: event.candidate.type,
          protocol: event.candidate.protocol,
          address: event.candidate.address,
          port: event.candidate.port
        });
        this.socket?.emit('webrtc-ice-candidate', {
          callId: this.currentCallId,
          candidate: event.candidate
        });
      } else if (!event.candidate) {
        console.log('ICE gathering complete');
        // Clear ICE gathering timeout when complete
        if (this.iceGatheringTimeout) {
          clearTimeout(this.iceGatheringTimeout);
          this.iceGatheringTimeout = null;
        }
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote stream with', event.streams[0].getTracks().length, 'tracks');
      this.remoteStream = event.streams[0];
      
      // Clear connection timeout on successful remote stream
      this.clearConnectionTimeout();
      
      if (this.onRemoteStreamHandler) {
        this.onRemoteStreamHandler(this.remoteStream);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state changed:', pc.connectionState);
      if (this.onConnectionStateChangeHandler) {
        this.onConnectionStateChangeHandler(pc.connectionState);
      }

      if (pc.connectionState === 'connected') {
        console.log('WebRTC connection established successfully!');
        this.clearConnectionTimeout();
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.error('WebRTC connection failed or disconnected');
        this.clearConnectionTimeout();
        this.handleCallEnd('connection_failed');
      } else if (pc.connectionState === 'connecting') {
        console.log('WebRTC connection in progress...');
        // Set a timeout for connecting state
        this.setConnectionTimeout();
      }
    };

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        console.log('ICE connection established!');
        this.clearConnectionTimeout();
      } else if (pc.iceConnectionState === 'failed') {
        console.log('ICE connection failed, attempting restart');
        pc.restartIce();
        // Set timeout for restart attempt
        this.setConnectionTimeout(15000); // 15 seconds for restart
      } else if (pc.iceConnectionState === 'disconnected') {
        console.warn('ICE connection disconnected');
        // Give some time for reconnection
        this.setConnectionTimeout(10000);
      } else if (pc.iceConnectionState === 'checking') {
        console.log('ICE connection checking...');
        this.setConnectionTimeout();
      }
    };

    // Handle ICE gathering state changes
    pc.onicegatheringstatechange = () => {
      console.log('ICE gathering state:', pc.iceGatheringState);
      
      if (pc.iceGatheringState === 'gathering') {
        // Set timeout for ICE gathering
        this.iceGatheringTimeout = setTimeout(() => {
          console.warn('ICE gathering timeout - this may indicate network issues');
          // Don't fail the call yet, but log the issue
        }, 20000); // 20 seconds for ICE gathering
      } else if (pc.iceGatheringState === 'complete') {
        if (this.iceGatheringTimeout) {
          clearTimeout(this.iceGatheringTimeout);
          this.iceGatheringTimeout = null;
        }
      }
    };

    // Handle signaling state changes
    pc.onsignalingstatechange = () => {
      console.log('Signaling state:', pc.signalingState);
    };

    return pc;
  }

  // Set connection timeout
  private setConnectionTimeout(timeoutMs: number = 30000): void {
    this.clearConnectionTimeout();
    
    this.connectionTimeout = setTimeout(() => {
      console.error(`WebRTC connection timeout after ${timeoutMs}ms`);
      this.handleCallEnd('connection_timeout');
    }, timeoutMs);
    
    console.log(`Set connection timeout for ${timeoutMs}ms`);
  }

  // Clear connection timeout
  private clearConnectionTimeout(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
      console.log('Cleared connection timeout');
    }
  }

  // Setup Socket.IO event listeners
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Handle WebRTC offer
    this.socket.on('webrtc-offer', async (data: { callId: string; offer: RTCSessionDescriptionInit }) => {
      try {
        console.log('Received WebRTC offer for call:', data.callId);
        this.currentCallId = data.callId;
        
        // Small delay to ensure proper setup
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Create peer connection if it doesn't exist
        if (!this.peerConnection) {
          console.log('Creating new peer connection for offer');
          this.peerConnection = this.createPeerConnection();
          
          // Initialize local stream if not already done
          await this.initializeLocalStream();
          
          // Add local stream to peer connection
          if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
              this.peerConnection!.addTrack(track, this.localStream!);
            });
            console.log('Added local stream to peer connection');
          }
        }

        // Set remote description
        console.log('Setting remote description...');
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        console.log('Remote description set successfully');
        
        // Create and send answer
        console.log('Creating answer...');
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        console.log('Local description set, sending answer...');
        
        this.socket.emit('webrtc-answer', {
          callId: data.callId,
          answer: answer
        });
        console.log('WebRTC answer sent');
      } catch (error) {
        console.error('Error handling WebRTC offer:', error);
        this.handleCallEnd('webrtc_error');
      }
    });

    // Handle WebRTC answer
    this.socket.on('webrtc-answer', async (data: { callId: string; answer: RTCSessionDescriptionInit }) => {
      try {
        console.log('Received WebRTC answer for call:', data.callId);
        
        if (this.peerConnection && data.callId === this.currentCallId) {
          console.log('Setting remote description from answer...');
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
          console.log('Remote description set successfully from answer');
        } else {
          console.warn('No peer connection or call ID mismatch for answer:', {
            hasPeerConnection: !!this.peerConnection,
            currentCallId: this.currentCallId,
            receivedCallId: data.callId
          });
        }
      } catch (error) {
        console.error('Error handling WebRTC answer:', error);
        this.handleCallEnd('webrtc_error');
      }
    });

    // Handle ICE candidates
    this.socket.on('webrtc-ice-candidate', async (data: { callId: string; candidate: RTCIceCandidateInit }) => {
      try {
        if (this.peerConnection && data.callId === this.currentCallId) {
          console.log('Adding ICE candidate for call:', data.callId);
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
          console.log('ICE candidate added successfully');
        } else {
          console.warn('Cannot add ICE candidate - no peer connection or call ID mismatch:', {
            hasPeerConnection: !!this.peerConnection,
            currentCallId: this.currentCallId,
            receivedCallId: data.callId
          });
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
        // Don't end call for ICE candidate errors as they're common
      }
    });
  }

  // Initiate call (caller side)
  async initiateCall(callId: string): Promise<void> {
    try {
      console.log('Initiating WebRTC call for:', callId);
      this.currentCallId = callId;
      
      // Clear any existing timeouts
      this.clearConnectionTimeout();
      
      // Create peer connection
      console.log('Creating peer connection for caller...');
      this.peerConnection = this.createPeerConnection();
      
      // Initialize and add local stream
      console.log('Initializing local stream for caller...');
      await this.initializeLocalStream();
      
      if (this.localStream) {
        console.log('Adding local stream tracks to peer connection...');
        this.localStream.getTracks().forEach(track => {
          console.log('Adding track:', track.kind, track.enabled);
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }
      
      // Set initial timeout for the entire call setup process
      this.setConnectionTimeout(45000); // 45 seconds for complete setup
      
      // Create and send offer
      console.log('Creating WebRTC offer...');
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      
      console.log('Setting local description with offer...');
      await this.peerConnection.setLocalDescription(offer);
      
      console.log('Sending WebRTC offer via socket...');
      this.socket?.emit('webrtc-offer', {
        callId: callId,
        offer: offer
      });
      console.log('WebRTC offer sent successfully');
    } catch (error) {
      console.error('Error initiating call:', error);
      this.clearConnectionTimeout();
      throw new Error('Failed to initiate call');
    }
  }

  // Accept call (callee side)
  async acceptCall(callId: string): Promise<void> {
    try {
      console.log('Accepting WebRTC call for:', callId);
      this.currentCallId = callId;
      
      // Clear any existing timeouts
      this.clearConnectionTimeout();
      
      // Create peer connection for callee
      if (!this.peerConnection) {
        console.log('Creating peer connection for callee...');
        this.peerConnection = this.createPeerConnection();
      } else {
        console.log('Peer connection already exists for callee');
      }
      
      // Initialize local stream
      console.log('Initializing local stream for callee...');
      await this.initializeLocalStream();
      
      // Add local stream to peer connection
      if (this.localStream) {
        console.log('Adding local stream tracks to peer connection for callee...');
        this.localStream.getTracks().forEach(track => {
          console.log('Adding track for callee:', track.kind, track.enabled);
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      } else {
        console.warn('No local stream available for callee');
      }
      
      // Set timeout for call setup
      this.setConnectionTimeout(45000); // 45 seconds for complete setup
      
      console.log('WebRTC call accepted, waiting for offer...');
    } catch (error) {
      console.error('Error accepting call:', error);
      this.clearConnectionTimeout();
      throw new Error('Failed to accept call');
    }
  }

  // End current call
  endCall(): void {
    this.handleCallEnd('ended');
  }

  // Handle call end
  private handleCallEnd(reason: string): void {
    console.log(`Call ended: ${reason}`);
    
    // Clear all timeouts
    this.clearConnectionTimeout();
    if (this.iceGatheringTimeout) {
      clearTimeout(this.iceGatheringTimeout);
      this.iceGatheringTimeout = null;
    }
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    // Reset state
    this.remoteStream = null;
    this.currentCallId = null;
    
    // Notify handler
    if (this.onCallEndHandler) {
      this.onCallEndHandler(reason);
    }
  }

  // Toggle microphone
  toggleMicrophone(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Get microphone state
  isMicrophoneEnabled(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      return audioTrack ? audioTrack.enabled : false;
    }
    return false;
  }

  // Event handler setters
  onRemoteStream(handler: (stream: MediaStream) => void): void {
    this.onRemoteStreamHandler = handler;
  }

  onCallEnd(handler: (reason: string) => void): void {
    this.onCallEndHandler = handler;
  }

  onConnectionStateChange(handler: (state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateChangeHandler = handler;
  }

  // Get current call state
  getCallState(): {
    isInCall: boolean;
    callId: string | null;
    connectionState: RTCPeerConnectionState | null;
    microphoneEnabled: boolean;
  } {
    return {
      isInCall: this.currentCallId !== null,
      callId: this.currentCallId,
      connectionState: this.peerConnection?.connectionState || null,
      microphoneEnabled: this.isMicrophoneEnabled()
    };
  }

  // Cleanup method
  cleanup(): void {
    console.log('Cleaning up WebRTC service...');
    
    // Clear all timeouts
    this.clearConnectionTimeout();
    if (this.iceGatheringTimeout) {
      clearTimeout(this.iceGatheringTimeout);
      this.iceGatheringTimeout = null;
    }
    
    // Only cleanup if there's an active call
    if (this.currentCallId || this.peerConnection) {
      this.handleCallEnd('cleanup');
    }
  }
} 