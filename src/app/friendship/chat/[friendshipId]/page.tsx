"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { 
  ArrowLeft,
  Send,
  Flame,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Wand2,
  Loader2,
  Gift
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getCurrentPrompt,
  submitPromptResponse,
  getResponses,
  getStreak,
  getCompatibility,
  getFriendshipDetails,
  generateUserQuestion,
  verifyToken,
  getAllPreviousQAs,
  updateActivity,
} from "@/lib/api/friendship";
import { setUser } from "@/redux/userSlice";
import { useDispatch } from "react-redux";
import { FriendshipChatProvider, useFriendshipChatContext } from "@/contexts/FriendshipChatContext";
import { formatDistanceToNow } from "date-fns";

function ChatContent() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const friendshipId = params.friendshipId as string;
  const { user } = useSelector((state: RootState) => state.user);
  
  const {
    messages,
    loading: chatLoading,
    sendMessage,
    currentFriendshipId,
    setCurrentFriendshipId,
  } = useFriendshipChatContext();

  const [prompt, setPrompt] = useState<any>(null);
  const [responses, setResponses] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [compatibility, setCompatibility] = useState<any>(null);
  const [friendship, setFriendship] = useState<any>(null);
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isPromptCollapsed, setIsPromptCollapsed] = useState(true);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [canGenerateQuestion, setCanGenerateQuestion] = useState(true);
  const [showQuestionReveal, setShowQuestionReveal] = useState(false);
  const [previousQAs, setPreviousQAs] = useState<any[]>([]);
  const [showPreviousQAs, setShowPreviousQAs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      // Check authentication first
      const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
      const userId = typeof window !== "undefined" ? sessionStorage.getItem("id") : null;
      
      if (!token || !userId) {
        // Store the current URL to redirect back after login
        sessionStorage.setItem("redirectAfterLogin", `/friendship/chat/${friendshipId}`);
        router.replace("/friendship/onboarding");
        return;
      }

      try {
        // Verify token
        const { user: verifiedUser } = await verifyToken();
        
        // Update sessionStorage and Redux
        sessionStorage.setItem("user", JSON.stringify(verifiedUser));
        sessionStorage.setItem("id", verifiedUser._id);
        sessionStorage.setItem("name", verifiedUser.name || "");
        dispatch(setUser(verifiedUser));
        
        if (friendshipId) {
          setCurrentFriendshipId(friendshipId);
          loadData();
          
          // Check if user came from WhatsApp link
          const fromWhatsApp = sessionStorage.getItem(`question_reveal_${friendshipId}`);
          if (fromWhatsApp === 'true') {
            setShowQuestionReveal(true);
            sessionStorage.removeItem(`question_reveal_${friendshipId}`);
          }
        }
      } catch (error: any) {
        // Token invalid, redirect to onboarding
        console.error("Authentication failed:", error);
        sessionStorage.clear();
        sessionStorage.setItem("redirectAfterLogin", `/friendship/chat/${friendshipId}`);
        router.replace("/friendship/onboarding");
      }
    };

    checkAuthAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendshipId, setCurrentFriendshipId]);
  
  // Update last activity when user is on chat page
  useEffect(() => {
    const updateUserActivity = async () => {
      try {
        await updateActivity();
      } catch (error) {
        // Ignore errors
      }
    };
    
    updateUserActivity();
    const interval = setInterval(updateUserActivity, 60000); // Update every minute
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendshipId]);
  
  // Check URL params for question reveal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reveal') === 'true' && prompt) {
        setShowQuestionReveal(true);
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [prompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for responses if user has answered but friend hasn't
  useEffect(() => {
    if (!prompt?.user_answered || !friendship || !friendshipId) {
      return;
    }
    
    if (responses?.both_answered) {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const responsesData = await getResponses(friendshipId);
        
        if (responsesData && responsesData.both_answered) {
          setResponses(responsesData);
          clearInterval(pollInterval);
          toast.success("Both of you have answered! 🎉");
          
          // Refresh previousQAs to include the newly answered question
          try {
            const updatedQAs = await getAllPreviousQAs(friendshipId);
            setPreviousQAs(updatedQAs.previous_qas || []);
          } catch (e) {
            // Ignore error
          }
        } else if (responsesData && !responsesData.both_answered) {
          setResponses(responsesData);
        }
      } catch (e: any) {
        // Friend hasn't answered yet, continue polling
      }
    }, 3000);

    return () => {
      clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt?.user_answered, friendshipId, friendship, responses?.both_answered]);

  const loadData = async () => {
    try {
      const [promptData, streakData, compatData, friendshipData, previousQAsData] = await Promise.all([
        getCurrentPrompt(friendshipId),
        getStreak(friendshipId),
        getCompatibility(friendshipId),
        getFriendshipDetails(friendshipId),
        getAllPreviousQAs(friendshipId).catch(() => ({ previous_qas: [] })),
      ]);

      const promptWithAnswered = {
        ...promptData.prompt,
        user_answered: promptData.user_answered || false,
        response_text: promptData.response_text || null,
      };

      setPrompt(promptWithAnswered);
      setStreak(streakData);
      setCompatibility(compatData);
      setFriendship(friendshipData.friendship);
      setPreviousQAs(previousQAsData.previous_qas || []);

      // Check if there's an unanswered user-initiated question
      // But allow the initiator to see the question even if they haven't answered
      const currentUserId = typeof window !== "undefined" ? sessionStorage.getItem("id") : null;
      const isInitiator = promptData.prompt?.initiated_by_user_id === currentUserId;
      
      if (promptData.prompt?.prompt_type === "user_initiated" && !promptData.user_answered && !isInitiator) {
        // Only block if it's not the initiator
        setCanGenerateQuestion(false);
      } else {
        setCanGenerateQuestion(true);
      }

      if (promptData.user_answered && promptData.response_text) {
        setResponseText(promptData.response_text);
      } else if (promptData.prompt?.prompt_type === "user_initiated" && isInitiator && !promptData.user_answered) {
        // If initiator hasn't answered, allow them to see and answer the question
        setResponseText("");
      }

      if (promptData.user_answered) {
        try {
          const responsesData = await getResponses(friendshipId);
          setResponses(responsesData);
          
          // If both answered, refresh previousQAs to include the current question
          if (responsesData.both_answered) {
            try {
              const updatedQAs = await getAllPreviousQAs(friendshipId);
              setPreviousQAs(updatedQAs.previous_qas || []);
            } catch (e) {
              // Ignore error, keep existing previousQAs
            }
          }
          
          // If both answered, allow generating new question
          if (responsesData.both_answered && promptData.prompt?.prompt_type === "user_initiated") {
            setCanGenerateQuestion(true);
          }
        } catch (e: any) {
          if (promptData.response_text) {
            setResponses({
              your_response: {
                text: promptData.response_text,
                answered_at: new Date().toISOString(),
              },
              friend_response: null,
              both_answered: false,
            });
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load data");
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || !prompt) {
      toast.error("Please enter your answer");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitPromptResponse(friendshipId, prompt._id, responseText.trim());
      toast.success("Response submitted! ✨");
      const submittedText = responseText.trim();
      setResponseText("");
      
      setPrompt({ ...prompt, user_answered: true });
      
      try {
        const responsesData = await getResponses(friendshipId);
        setResponses(responsesData);
        
        if (responsesData.both_answered) {
          toast.success("Both of you have answered! 🎉");
        }
      } catch (e: any) {
        setResponses({
          your_response: {
            text: submittedText,
            answered_at: new Date().toISOString(),
          },
          friend_response: null,
          both_answered: false,
        });
      }
      
      await loadData();
    } catch (error: any) {
      console.error("Error submitting response:", error);
      toast.error(error.message || "Failed to submit response");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateQuestion = async () => {
    if (!canGenerateQuestion) {
      toast.error("Please answer the previous question first");
      return;
    }

    setIsGeneratingQuestion(true);
    try {
      const result = await generateUserQuestion(friendshipId);
      toast.success("Question generated! ✨");
      
      // Reload data to show the new question
      await loadData();
      
      // Expand prompt section to show the new question
      setIsPromptCollapsed(false);
    } catch (error: any) {
      console.error("Error generating question:", error);
      toast.error(error.message || "Failed to generate question");
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !friendship) {
      toast.error("Please enter a message");
      return;
    }

    if (!prompt?.user_answered) {
      toast.error("Please answer today's prompt first before chatting");
      return;
    }

    setIsSendingMessage(true);
    try {
      const currentUserId = typeof window !== "undefined" ? sessionStorage.getItem("id") : null;
      if (!currentUserId) {
        throw new Error("User not authenticated");
      }

      const receiverId = friendship.friend._id;

      await sendMessage(
        friendshipId,
        messageText.trim(),
        receiverId,
        user?.name || "You",
        user?.image || ""
      );
      setMessageText("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const getCompatibilityCategory = (score: number) => {
    if (score >= 85) return { label: "PERFECT MATCH", emoji: "💫", color: "bg-purple-500", message: "Incredible connection!" };
    if (score >= 75) return { label: "GREAT CHEMISTRY", emoji: "✨", color: "bg-pink-500", message: "Strong bond!" };
    if (score >= 65) return { label: "GROWING CLOSER", emoji: "🌱", color: "bg-green-500", message: "Building connection" };
    if (score >= 50) return { label: "ON THE RISE", emoji: "📈", color: "bg-blue-500", message: "Getting stronger" };
    if (score >= 35) return { label: "EARLY DAYS", emoji: "🌅", color: "bg-yellow-500", message: "Just getting started" };
    return { label: "BUILDING", emoji: "💙", color: "bg-purple-500", message: "Your journey begins" };
  };

  if (!friendship || !prompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const compat = compatibility ? getCompatibilityCategory(compatibility.score) : null;
  const currentUserId = typeof window !== "undefined" ? sessionStorage.getItem("id") : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Question Reveal Popup */}
      <Dialog open={showQuestionReveal} onOpenChange={setShowQuestionReveal}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Gift className="h-16 w-16 text-purple-500 animate-bounce" />
                <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-gray-900">
              New Question Unlocked! 🎉
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
              {prompt?.prompt_type === "user_initiated" 
                ? `${prompt?.initiated_by || "Your friend"} has a question for you!`
                : "Your daily friendship question is here!"}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 p-4 bg-white rounded-lg border-2 border-purple-300 shadow-lg">
            <p className="text-lg font-semibold text-gray-900 text-center">
              {prompt?.text}
            </p>
          </div>
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => {
                setShowQuestionReveal(false);
                setIsPromptCollapsed(false); // Expand the prompt section
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-2 rounded-full shadow-lg"
            >
              Let&apos;s Answer! ✨
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fixed Header - Below main navbar */}
      <div className="fixed top-16 left-0 right-0 bg-white border-b z-40">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/friendship/dashboard")}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-9 w-9">
                <AvatarImage src={friendship.friend.avatar} />
                <AvatarFallback className="bg-gray-200 text-gray-700">
                  {friendship.friend.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-medium text-gray-900 text-sm">{friendship.friend.name}</h1>
                {streak && (
                  <p className="text-xs text-gray-500">
                    Day {streak.current_day}/30 • {streak.current_streak} day streak
                  </p>
                )}
              </div>
            </div>
            {compat && compatibility && (
              <div className="flex flex-col items-end">
                <Badge className={`${compat.color} text-white text-xs mb-1`}>
                  {compatibility.score}% {compat.emoji}
                </Badge>
                <span className="text-xs text-gray-500">Compatibility</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Prompt Section */}
      <div className="bg-white border-b sticky top-[128px] z-30">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setIsPromptCollapsed(!isPromptCollapsed)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-900">
                {prompt.prompt_type === "user_initiated" 
                  ? `✨ AI Question${prompt.initiated_by ? ` by ${prompt.initiated_by}` : ""}`
                  : prompt.day 
                    ? `Day ${prompt.day} Question`
                    : "✨ Most Recent Question"}
              </span>
              {prompt.prompt_type === "user_initiated" && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  AI Generated
                </Badge>
              )}
              {prompt.user_answered && responses?.both_answered && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  Both answered
                </Badge>
              )}
              {prompt.user_answered && responses && !responses.both_answered && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                  Waiting
                </Badge>
              )}
            </div>
            {isPromptCollapsed ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {!isPromptCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-4 border-t">
                  <div className="pt-4">
                    <p className="text-gray-900 font-medium mb-4">{prompt.text}</p>

                    {/* Response Input */}
                    {!prompt.user_answered && (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Share your thoughts... (max 500 characters)"
                          value={responseText}
                          onChange={(e) => {
                            if (e.target.value.length <= 500) {
                              setResponseText(e.target.value);
                            }
                          }}
                          maxLength={500}
                          rows={3}
                          className="resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {responseText.length}/500 characters
                          </p>
                          <Button
                            onClick={handleSubmitResponse}
                            disabled={isSubmitting || !responseText.trim()}
                            size="sm"
                          >
                            {isSubmitting ? "Submitting..." : "Submit"}
                            <CheckCircle2 className="ml-2 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Waiting State */}
                    {prompt.user_answered && responses && responses.friend_response === null && (
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs font-medium text-blue-800 mb-1">Your Answer:</p>
                          <p className="text-sm text-blue-900">{responses.your_response?.text}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 animate-spin" />
                          <span>Waiting for {friendship.friend.name} to answer...</span>
                        </div>
                      </div>
                    )}

                    {/* Both Responses */}
                    {responses?.friend_response && (
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs font-medium text-blue-800 mb-1">Your Answer:</p>
                          <p className="text-sm text-blue-900">{responses.your_response.text}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-xs font-medium text-purple-800 mb-1">
                            {responses.friend_response.friend_name}&apos;s Answer:
                          </p>
                          <p className="text-sm text-purple-900">{responses.friend_response.text}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Previous Q&As Section - Show all previous questions (including current if both answered) */}
                  {previousQAs.length > 0 && (
                    <div className="pt-4 border-t mt-4">
                      <button
                        onClick={() => setShowPreviousQAs(!showPreviousQAs)}
                        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 py-2 transition-colors"
                      >
                        <span>
                          All Questions & Answers ({previousQAs.length})
                        </span>
                        {showPreviousQAs ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      
                      {showPreviousQAs && (
                        <div className="mt-3 space-y-3 max-h-[400px] overflow-y-auto pr-2">
                          {previousQAs.map((qa, idx) => (
                            <div
                              key={qa.prompt_id || idx}
                              className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {qa.day && (
                                  <Badge variant="outline" className="text-xs bg-white text-gray-700 border-gray-300">
                                    Day {qa.day}
                                  </Badge>
                                )}
                                {qa.prompt_type === "user_initiated" && (
                                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                    ✨ AI
                                  </Badge>
                                )}
                                {!qa.day && qa.prompt_type !== "user_initiated" && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    Recent
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-semibold text-gray-900 mb-3">{qa.question}</p>
                              <div className="space-y-2">
                                <div className="p-2.5 bg-blue-50 rounded-md border border-blue-200">
                                  <p className="text-xs font-semibold text-blue-800 mb-1">You:</p>
                                  <p className="text-sm text-blue-900 leading-relaxed">{qa.your_answer}</p>
                                </div>
                                <div className="p-2.5 bg-purple-50 rounded-md border border-purple-200">
                                  <p className="text-xs font-semibold text-purple-800 mb-1">{friendship.friend.name}:</p>
                                  <p className="text-sm text-purple-900 leading-relaxed">{qa.friend_answer}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-3xl mx-auto w-full pb-20 pt-32">
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        >
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === currentUserId;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} items-start gap-2`}
                >
                  {!isOwn && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={friendship.friend.avatar} />
                      <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                        {friendship.friend.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 ${
                      isOwn
                        ? "bg-purple-500 text-white"
                        : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <p className={`text-xs mt-1 ${isOwn ? "text-purple-100" : "text-gray-500"}`}>
                      {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  {isOwn && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image} />
                      <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input - Fixed at bottom */}
      {prompt.user_answered && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex gap-2 items-end">
              <Button
                onClick={handleGenerateQuestion}
                disabled={isGeneratingQuestion || !canGenerateQuestion}
                size="icon"
                variant="outline"
                className="h-11 w-11 rounded-full border-purple-300 hover:bg-purple-50 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm transition-all"
                title={!canGenerateQuestion ? "Answer the previous question first" : "Generate AI question"}
              >
                {isGeneratingQuestion ? (
                  <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
                ) : (
                  <Wand2 className="h-5 w-5 text-purple-500" />
                )}
              </Button>
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={1}
                  className="resize-none min-h-[44px] max-h-32 pr-12 py-3 rounded-2xl border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 bg-gray-50 text-gray-900 placeholder:text-gray-400"
                />
                <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                  {messageText.length > 0 && "Enter to send"}
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={isSendingMessage || !messageText.trim()}
                size="icon"
                className="h-11 w-11 rounded-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FriendshipChatPage() {
  return (
    <FriendshipChatProvider>
      <ChatContent />
    </FriendshipChatProvider>
  );
}
