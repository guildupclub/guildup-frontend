"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { WebRTCService, CallData, CallParticipant } from '@/services/webrtcService';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { toast } from 'sonner';

export type CallStatus = 'idle' | 'ringing' | 'connecting' | 'active' | 'ended';

interface VoiceCallContextType {
  // Connection state
  isConnected: boolean;
  
  // Call state
  currentCall: CallData | null;
  callStatus: CallStatus;
  isIncomingCall: boolean;
  isMuted: boolean;
  
  // Call actions
  initiateCall: (callee: CallParticipant) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  
  // Audio
  localAudioRef: React.RefObject<HTMLAudioElement | null>;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
}

const VoiceCallContext = createContext<VoiceCallContextType | undefined>(undefined);

export const useVoiceCall = () => {
  const context = useContext(VoiceCallContext);
  if (!context) {
    throw new Error('useVoiceCall must be used within a VoiceCallProvider');
  }
  return context;
};

interface VoiceCallProviderProps {
  children: React.ReactNode;
}

export const VoiceCallProvider: React.FC<VoiceCallProviderProps> = ({ children }) => {
  const user = useSelector((state: RootState) => state.user.user);
  
  // Test WebRTC service import
  console.log('WebRTCService import check:', { 
    WebRTCServiceExists: !!WebRTCService,
    WebRTCServiceType: typeof WebRTCService 
  });
  
  // Test WebRTC service creation
  useEffect(() => {
    console.log('Testing WebRTC service creation...');
    try {
      // Create a dummy socket for testing
      const testSocket = { on: () => {}, emit: () => {} };
      const testService = new WebRTCService(testSocket as any);
      console.log('✅ WebRTC service creation test successful');
      testService.cleanup();
    } catch (error) {
      console.error('❌ WebRTC service creation test failed:', error);
    }
  }, []);
  
  // Refs for audio elements
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Ref to persist WebRTC service
  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  
  // Ref to persist current call data and prevent loss during re-renders
  const currentCallRef = useRef<CallData | null>(null);
  
  // State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [webrtcService, setWebrtcService] = useState<WebRTCService | null>(null);
  const [currentCall, setCurrentCall] = useState<CallData | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSettingUpCall, setIsSettingUpCall] = useState(false); // Prevent premature resets

  // Wrapper function to keep currentCall state and ref in sync
  const updateCurrentCall = (call: CallData | null) => {
    console.log('📞 Updating current call:', { 
      from: currentCall?.id || 'null', 
      to: call?.id || 'null',
      stackTrace: new Error().stack?.split('\n').slice(1, 3).join('\n')
    });
    currentCallRef.current = call;
    setCurrentCall(call);
  };
  
  // Initialize socket connection
  useEffect(() => {
    console.log('VoiceCallProvider useEffect triggered:', { 
      userEmail: user?.email,
      userName: user?.name,
      existingSocket: !!socket,
      existingWebrtcService: !!webrtcService,
      existingWebrtcServiceRef: !!webrtcServiceRef.current
    });
    
    if (!user?.email) {
      console.warn('No user email available, cannot initialize voice call');
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    console.log('Connecting to backend:', backendUrl);
    
    const socketInstance = io(backendUrl, {
      transports: ['polling', 'websocket'],
      upgrade: true,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to voice call server, socket ID:', socketInstance.id);
      setIsConnected(true);
      
      // Register user
      const userData = {
        userId: user.email,
        email: user.email,
        name: user.name || 'Anonymous'
      };
      console.log('Registering user:', userData);
      socketInstance.emit('register-user', userData);
      
      // Force WebRTC service initialization after socket connection
      console.log('Socket connected, checking WebRTC service initialization...');
      
      // Manual WebRTC service initialization as fallback
      console.log('Setting up manual WebRTC initialization timeout...');
      setTimeout(() => {
        console.log('Manual WebRTC initialization timeout triggered, checking state...');
        console.log('Current state:', {
          hasWebrtcServiceRef: !!webrtcServiceRef.current,
          hasWebrtcServiceState: !!webrtcService,
          socketId: socketInstance.id,
          isConnected: socketInstance.connected
        });
        
        if (!webrtcServiceRef.current) {
          console.log('🔧 Force initializing WebRTC service...');
          try {
            const service = new WebRTCService(socketInstance);
            
            // Store in ref
            webrtcServiceRef.current = service;
            console.log('✅ WebRTC service stored in ref');
            
            // Set up handlers
            service.onRemoteStream((stream: MediaStream) => {
              console.log('Setting remote stream (manual init)');
              if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = stream;
                remoteAudioRef.current.play().catch(console.error);
              }
              setCallStatus('active');
              toast.success('Voice call connected');
            });
            
            service.onCallEnd((reason: string) => {
              console.log('WebRTC call ended (manual init):', reason);
              resetCallState();
            });
            
            service.onConnectionStateChange((state: RTCPeerConnectionState) => {
              console.log('WebRTC connection state (manual init):', state);
              if (state === 'connected') {
                setCallStatus('active');
                toast.success('Voice call connected');
              } else if (state === 'failed' || state === 'disconnected') {
                toast.error('Voice connection lost');
                endCall();
              }
            });
            
            setWebrtcService(service);
            console.log('✅ WebRTC service force initialized successfully');
          } catch (error) {
            console.error('❌ Error during manual WebRTC initialization:', error);
          }
        } else {
          console.log('WebRTC service already exists in ref, skipping manual init');
        }
      }, 1000);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from voice call server');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    socketInstance.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Handle incoming call
    socketInstance.on('incoming-call', (data: { callId: string; caller: CallParticipant; type: string }) => {
      console.log('Incoming call from:', data.caller.name);
      
      const callData: CallData = {
        id: data.callId,
        caller: data.caller,
        callee: {
          id: user.email!,
          email: user.email!,
          name: user.name || 'Anonymous'
        },
        type: 'voice',
        status: 'ringing',
        startTime: new Date()
      };
      
      updateCurrentCall(callData);
      setCallStatus('ringing');
      setIsIncomingCall(true);
      
      // Show notification
      toast.info(`Incoming call from ${data.caller.name}`, {
        duration: 30000, // 30 seconds
        action: {
          label: 'Answer',
          onClick: () => acceptCall(),
        },
      });
    });

    // Handle call initiated confirmation
    socketInstance.on('call-initiated', (data: { callId: string; status: string }) => {
      console.log('Call initiated:', data.callId);
      setCallStatus('ringing');
    });

    // Handle call accepted
    socketInstance.on('call-accepted', async (data: { callId: string }) => {
      console.log('Call accepted:', data.callId);
      setCallStatus('connecting');
      setIsIncomingCall(false);
      setIsSettingUpCall(true); // Protect call data during setup
      
      // Add timeout for connection attempt with retry logic
      const connectionTimeout = setTimeout(() => {
        console.error('WebRTC connection timeout - attempting to end call gracefully');
        toast.error('Connection timeout - please try again');
        setIsSettingUpCall(false);
        
        // Try to end the call gracefully through the backend
        if (socketInstance && socketInstance.connected) {
          const activeCurrentCall = currentCall || currentCallRef.current;
          if (activeCurrentCall) {
            socketInstance.emit('end-call', { 
              callId: activeCurrentCall.id, 
              reason: 'connection_timeout' 
            });
          }
        }
        
        // Force reset after a short delay
        setTimeout(() => {
          resetCallState();
        }, 1000);
      }, 45000); // 45 second timeout to match WebRTC service
      
      // Wait for WebRTC service to be ready if it's not initialized yet
      let attempts = 0;
      const maxAttempts = 20; // Increased attempts
      while (!webrtcService && !webrtcServiceRef.current && attempts < maxAttempts) {
        console.log(`Waiting for WebRTC service... attempt ${attempts + 1}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      
      // Additional check - wait a bit more if service was just created
      if ((webrtcService || webrtcServiceRef.current) && attempts > 0) {
        console.log('WebRTC service found, waiting additional 500ms for initialization...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Start WebRTC connection
      const activeWebrtcService = webrtcService || webrtcServiceRef.current;
      const activeCurrentCall = currentCall || currentCallRef.current;
      console.log('WebRTC service check before start:', {
        hasWebrtcService: !!webrtcService,
        hasWebrtcServiceRef: !!webrtcServiceRef.current,
        hasCurrentCall: !!currentCall,
        hasCurrentCallRef: !!currentCallRef.current,
        activeWebrtcService: !!activeWebrtcService,
        activeCurrentCall: !!activeCurrentCall,
        attemptsToWait: attempts
      });
      
      if (activeWebrtcService && activeCurrentCall) {
        try {
          if (activeCurrentCall.caller.id === user.email) {
            // I'm the caller, initiate WebRTC
            console.log('Starting WebRTC as caller...');
            await activeWebrtcService.initiateCall(data.callId);
          } else {
            // I'm the callee, prepare for WebRTC
            console.log('Starting WebRTC as callee...');
            await activeWebrtcService.acceptCall(data.callId);
          }
          
          // Clear timeout on successful setup
          clearTimeout(connectionTimeout);
          setIsSettingUpCall(false);
          console.log('✅ WebRTC setup completed successfully');
        } catch (error) {
          clearTimeout(connectionTimeout);
          setIsSettingUpCall(false);
          console.error('Error starting WebRTC:', error);
          toast.error('Failed to establish voice connection - please try again');
          
          // Emit call end to notify the backend
          if (socketInstance && socketInstance.connected && activeCurrentCall) {
            socketInstance.emit('end-call', { 
              callId: activeCurrentCall.id, 
              reason: 'webrtc_setup_failed' 
            });
          }
          
          setTimeout(() => {
            resetCallState();
          }, 1000);
        }
      } else {
        // WebRTC service exists but call was lost - this is the issue!
        clearTimeout(connectionTimeout);
        setIsSettingUpCall(false);
        console.error('❌ WebRTC service available but currentCall was lost!', {
          hasWebrtcService: !!webrtcService,
          hasWebrtcServiceRef: !!webrtcServiceRef.current,
          hasCurrentCall: !!currentCall,
          hasCurrentCallRef: !!currentCallRef.current,
          callId: data.callId,
          waitAttempts: attempts
        });
        toast.error('Call setup failed - please try again');
        
        // Emit call end to notify the backend
        if (socketInstance && socketInstance.connected) {
          socketInstance.emit('end-call', { 
            callId: data.callId, 
            reason: 'call_data_lost' 
          });
        }
        
        setTimeout(() => {
          resetCallState();
        }, 1000);
      }
    });

    // Handle call ended
    socketInstance.on('call-ended', (data: { callId: string; reason: string; duration?: number }) => {
      console.log('📞 Call ended event received:', data, {
        currentCallId: currentCall?.id,
        callStatus,
        isIncomingCall
      });
      
      let message = 'Call ended';
      switch (data.reason) {
        case 'declined':
          message = 'Call declined';
          break;
        case 'ended':
          message = data.duration ? `Call ended (${Math.round(data.duration / 1000)}s)` : 'Call ended';
          break;
        case 'disconnected':
          message = 'Call disconnected';
          break;
        case 'timeout':
          message = 'Call timed out';
          break;
      }
      
      toast.info(message);
      resetCallState();
    });

    // Handle call failed
    socketInstance.on('call-failed', (data: { error: string; code: string }) => {
      console.error('Call failed:', data.error);
      
      let message = 'Call failed';
      switch (data.code) {
        case 'USER_OFFLINE':
          message = 'User is currently offline';
          break;
        case 'INITIATION_ERROR':
          message = 'Failed to initiate call';
          break;
        default:
          message = data.error;
      }
      
      toast.error(message);
      resetCallState();
    });

    setSocket(socketInstance);

    return () => {
      console.log('VoiceCallProvider unmounting, cleaning up...');
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.cleanup();
        webrtcServiceRef.current = null;
      }
      socketInstance.disconnect();
    };
  }, [user?.email, user?.name]);

  // Initialize WebRTC service when socket is ready
  useEffect(() => {
    console.log('WebRTC service useEffect triggered:', { 
      hasSocket: !!socket, 
      hasWebrtcService: !!webrtcService,
      isConnected 
    });
    
    if (socket && isConnected && !webrtcService) {
      console.log('Initializing WebRTC service...');
      const service = new WebRTCService(socket);
      
      // Store in ref to prevent garbage collection
      webrtcServiceRef.current = service;
      
      // Handle remote stream
      service.onRemoteStream((stream: MediaStream) => {
        console.log('Setting remote stream');
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = stream;
          remoteAudioRef.current.play().catch(console.error);
        }
        
        // Ensure call status is set to active
        console.log('Remote stream received - setting call status to active');
        setCallStatus('active');
        toast.success('Voice call connected');
      });
      
      // Handle call end
      service.onCallEnd((reason: string) => {
        console.log('WebRTC call ended:', reason);
        const activeCurrentCall = currentCall || currentCallRef.current;
        if (activeCurrentCall) {
          socket.emit('end-call', { callId: activeCurrentCall.id });
        }
        resetCallState();
      });
      
      // Handle connection state changes
      service.onConnectionStateChange((state: RTCPeerConnectionState) => {
        console.log('WebRTC connection state:', state);
        if (state === 'connected') {
          console.log('WebRTC connection established - setting call to active');
          setCallStatus('active');
          toast.success('Voice call connected');
        } else if (state === 'failed' || state === 'disconnected') {
          console.error('WebRTC connection failed or disconnected');
          toast.error('Voice connection lost');
          endCall();
        } else if (state === 'connecting') {
          console.log('WebRTC connection in progress...');
          setCallStatus('connecting');
        }
      });
      
      setWebrtcService(service);
      console.log('WebRTC service initialized successfully');
    } else {
      console.log('WebRTC service initialization skipped:', { 
        hasSocket: !!socket, 
        isConnected,
        hasWebrtcService: !!webrtcService 
      });
    }
  }, [socket, isConnected]);

  // Reset call state
  const resetCallState = () => {
    if (isSettingUpCall) {
      console.log('🛡️ Preventing call reset during WebRTC setup');
      return;
    }
    
    console.log('🔄 Resetting call state...', {
      currentCallId: currentCall?.id,
      callStatus,
      isIncomingCall,
      stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n')
    });
    updateCurrentCall(null);
    setCallStatus('idle');
    setIsIncomingCall(false);
    setIsMuted(false);
    setIsSettingUpCall(false);
    
    // Stop audio
    if (localAudioRef.current) {
      localAudioRef.current.srcObject = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    
    // Only cleanup WebRTC if there's an active peer connection
    if (webrtcService) {
      const callState = webrtcService.getCallState();
      console.log('WebRTC call state before cleanup:', callState);
      
      // Only cleanup if there's actually a call in progress
      if (callState.isInCall) {
        console.log('Cleaning up WebRTC service...');
        webrtcService.cleanup();
      } else {
        console.log('Skipping WebRTC cleanup - no active call');
      }
    }
  };

  // Initiate call
  const initiateCall = async (callee: CallParticipant) => {
    if (!socket || !user?.email || callStatus !== 'idle') {
      toast.error('Cannot initiate call at this time');
      return;
    }

    try {
      const callData: CallData = {
        id: '', // Will be set by server
        caller: {
          id: user.email!, // Use email as primary identifier
          email: user.email!,
          name: user.name || 'Anonymous'
        },
        callee,
        type: 'voice',
        status: 'ringing',
        startTime: new Date()
      };
      
      updateCurrentCall(callData);
      setCallStatus('ringing');
      setIsIncomingCall(false);
      
      // Send call initiation to server
      socket.emit('initiate-call', {
        callerId: user.email,
        callerEmail: user.email,
        callerName: user.name || 'Anonymous',
        calleeId: callee.id,
        calleeEmail: callee.email,
        calleeName: callee.name
      });
      
      toast.info(`Calling ${callee.name}...`);
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Failed to initiate call');
      resetCallState();
    }
  };

  // Accept call
  const acceptCall = async () => {
    const activeCurrentCall = currentCall || currentCallRef.current;
    if (!socket || !activeCurrentCall || !isIncomingCall) {
      return;
    }

    try {
      setCallStatus('connecting');
      
      // Accept call through socket
      socket.emit('accept-call', { callId: activeCurrentCall.id });
      
      toast.info('Accepting call...');
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error('Failed to accept call');
      resetCallState();
    }
  };

  // Reject call
  const rejectCall = () => {
    const activeCurrentCall = currentCall || currentCallRef.current;
    if (!socket || !activeCurrentCall) {
      return;
    }

    socket.emit('reject-call', { callId: activeCurrentCall.id, reason: 'declined' });
    resetCallState();
  };

  // End call
  const endCall = () => {
    const activeCurrentCall = currentCall || currentCallRef.current;
    if (!socket || !activeCurrentCall) {
      resetCallState();
      return;
    }

    socket.emit('end-call', { callId: activeCurrentCall.id });
    resetCallState();
  };

  // Toggle mute
  const toggleMute = () => {
    const activeWebrtcService = webrtcService || webrtcServiceRef.current;
    if (activeWebrtcService) {
      const enabled = activeWebrtcService.toggleMicrophone();
      setIsMuted(!enabled);
      toast.info(enabled ? 'Microphone unmuted' : 'Microphone muted');
    } else {
      console.warn('No WebRTC service available for toggle mute');
    }
  };

  const value: VoiceCallContextType = {
    isConnected,
    currentCall,
    callStatus,
    isIncomingCall,
    isMuted,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    localAudioRef,
    remoteAudioRef
  };

  return (
    <VoiceCallContext.Provider value={value}>
      {children}
      {/* Hidden audio elements for WebRTC streams */}
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />
    </VoiceCallContext.Provider>
  );
}; 