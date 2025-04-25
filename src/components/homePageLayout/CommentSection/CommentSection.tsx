// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Plus, Send } from "lucide-react";
// import { useSelector } from "react-redux";
// import { RootState } from "@/redux/store";

// interface Comment {
//   _id: string;
//   postedBy: CommentUser;
//   post_id: string;
//   text: string;
//   parentComment: string | null;
//   commentedAt: string;
//   replies: string[] | Comment[];
//   __v: number;
// }

// interface CommentUser {
//   _id: string;
//   user_name: string;
//   avatar: string | null;
// }

// interface CommentSectionProps {
//   postId: string;
// }

// interface ReplyInput {
//   text: string;
//   parentCommentId: string;
// }

// const CommentSection: React.FC<any> = ({ postId }) => {
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [newComment, setNewComment] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [loadedReplies, setLoadedReplies] = useState<Set<string>>(new Set());
//   const [nestedComments, setNestedComments] = useState<{ [key: string]: Comment[] }>({});
//   const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
//   const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
//   const [replyInputs, setReplyInputs] = useState<{ [key: string]: ReplyInput }>({});
//   const [showReplyInput, setShowReplyInput] = useState<Set<string>>(new Set());

//   const handleAddReply = async (commentId: string) => {
//     const userId = useSelector((state: RootState) => state.user.user?._id);

//     const sessionId = useSelector((state: RootState) => state.user.sessionId);
//     const replyInput = replyInputs[commentId];
//     if (!replyInput?.text?.trim()) return;

//     setLoading(true);
//     try {
//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/replyComment`,
//         {
//           postId,
//           commentId: replyInput.parentCommentId,
//           text: replyInput.text,
//           userId: userId,
//         }
//       );

//       setNestedComments(prev => ({
//         ...prev,
//         [replyInput.parentCommentId]: [...(prev[replyInput.parentCommentId] || []), response.data.data]
//       }));

//       // Clear reply input
//       setReplyInputs(prev => ({ ...prev, [commentId]: { text: '', parentCommentId: '' } }));

//     } catch (err) {
//       setError("Failed to add reply");
//     } finally {
//       setLoading(false);
//     }
//   };

//   console.log("@prostId", postId);
//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const response = await axios.post(
//           `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/getComments`,
//           {
//             postId: postId,
//             page: 0,
//             userId: "678ce60732c37c1222f913e0",
//           }
//         );
//         console.log("@reponseCOmments", response.data);
//         setComments(response.data.data);
//       } catch (err) {
//         setError("Failed to load comments");
//       }
//     };

//     fetchComments();
//   }, [postId]);

//   const handleAddComment = async () => {
//     if (!newComment.trim()) return;

//     setLoading(true);
//     try {
//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/post`,
//         {
//           postId,
//           comment: newComment,
//           userId: "678ce60732c37c1222f913e0",
//         }
//       );

//       setComments((prevComments) => [...prevComments, response.data.data]);
//       setNewComment("");
//     } catch (err) {
//       setError("Failed to add comment");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFetchReplies = async (commentId: string) => {
//     console.log("@commentID",commentId)
//     try {
//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/getNestedComment`,
//         {
//           postId: postId,
//           parentComment: commentId,
//           userId: "678ce60732c37c1222f913e0",
//         }
//       );
//       console.log("@CommentData", response.data);
//       setNestedComments(prev => ({
//         ...prev,
//         [commentId]: response.data.data
//       }));
//       setExpandedComments(prev => new Set([...prev, commentId]));

//     } catch (err) {
//       setError("Failed to load replies");
//     }
//   };

//   const renderReplyInput = (commentId: string) => (
//     <div className="flex gap-2 mt-4 ml-8">
//       <Avatar className="h-6 w-6">
//         <AvatarImage src="/placeholder.svg" />
//         <AvatarFallback>U</AvatarFallback>
//       </Avatar>
//       <div className="flex-1 relative">
//       <input
//         type="text"
//         value={replyInputs[commentId]?.text || ''}
//         onChange={(e) => setReplyInputs(prev => ({
//           ...prev,
//           [commentId]: { text: e.target.value, parentCommentId:commentId }
//         }))}
//         placeholder="Write a reply..."
//         className="w-full bg-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
//       />
//         <Button
//           variant="ghost"
//           size="icon"
//           className="absolute right-2 top-1/2 -translate-y-1/2"
//           onClick={() => handleAddReply(commentId)}
//         >
//           <Send className="h-4 w-4" />
//         </Button>
//       </div>
//     </div>
//   );

//   const renderComments = (comments: Comment[], level = 0) => {
//     console.log("@commentREnderData",comments)
//     return comments.map((comment) => (
//       <div key={comment._id} className="pl-[20px] mt-4">
//         <div className="flex items-center gap-2">
//           <Avatar className="h-6 w-6">
//             <AvatarImage src={comment?.postedBy?.avatar || "/placeholder.svg"} />
//             <AvatarFallback>{comment?.postedBy?.user_name}</AvatarFallback>
//           </Avatar>
//           <strong>{comment.postedBy?.user_name}</strong>
//           <span className="text-sm text-zinc-400">
//             {new Date(comment?.commentedAt).toLocaleDateString()}
//           </span>
//         </div>
//         <div className="mt-2 text-zinc-200">{comment.text}</div>
//         <div className="mt-2 flex gap-4">
//         <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => {
//               if (!expandedComments.has(comment._id)) {
//                 handleFetchReplies(comment._id);
//               }
//               setShowReplyInput(prev => {
//                 const next = new Set(prev);
//                 if (prev.has(comment._id)) {
//                   next.delete(comment._id);
//                 } else {
//                   next.add(comment._id);
//                 }
//                 return next;
//               });
//             }}
//           >
//             Reply
//           </Button>
//         </div>
//         {showReplyInput.has(comment._id) && renderReplyInput(comment._id)}
//         {expandedComments.has(comment._id) && nestedComments[comment._id] && (
//           <div className="ml-4">
//             {renderComments(nestedComments[comment._id])}
//           </div>
//         )}
//         </div>
//     ));
//   };

//   return (
//     <div className="border-t border-zinc-800/50">
//       <div className="p-4">
//         {error && <div className="error">{error}</div>}
//         {renderComments(comments)}
//         <div className="flex gap-2 mt-4">
//           <Avatar className="h-8 w-8">
//             <AvatarImage src="/placeholder.svg" />
//             <AvatarFallback>U</AvatarFallback>
//           </Avatar>
//           <div className="flex-1 relative">
//             <input
//               type="text"
//               value={newComment}
//               onChange={(e) => setNewComment(e.target.value)}
//               placeholder="Write a comment..."
//               className="w-full bg-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
//             />
//             <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8 text-zinc-400 hover:text-zinc-300"
//                 onClick={handleAddComment}
//                 disabled={loading}
//               >
//                 <Send className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CommentSection;

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Reply, Send } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stat } from "fs";

interface Comment {
  _id: string;
  postedBy: CommentUser;
  post_id: string;
  text: string;
  parentComment: string | null;
  commentedAt: string;
  replies: string[] | Comment[];
  __v: number;
}

interface CommentUser {
  _id: string;
  user_name: string;
  avatar: string | null;
}

interface CommentSectionProps {
  postId: string;
}

interface ReplyInput {
  text: string;
  parentCommentId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: ReplyInput }>(
    {}
  );
  const [showReplyInput, setShowReplyInput] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const user = useSelector((state: RootState) => state.user.user);
  const queryClient = useQueryClient();
  const [repliesData, setRepliesData] = useState<{
    [commentId: string]: Comment[];
  }>({});

  // Fetch main comments
  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/getComments`,
        {
          postId: postId,
          page: 0,
          userId: userId,
        }
      );
      return response.data.data;
    },
    enabled: !!postId && !!userId,
  });

  // Fetch nested comments (replies)
  const fetchReplies = async (commentId: string) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/getNestedComment`,
      {
        postId: postId,
        parentComment: commentId,
        userId: userId,
      }
    );
    return response.data.data;
  };

  useEffect(() => {
    const fetchAllReplies = async () => {
      if (!comments) return;

      const allReplies: { [commentId: string]: Comment[] } = {};

      for (const comment of comments) {
        if (expandedComments.has(comment._id)) {
          try {
            const replies = await fetchReplies(comment._id);
            allReplies[comment._id] = replies;
          } catch (error) {
            console.error("Error fetching replies:", error);
            allReplies[comment._id] = [];
          }
        }
      }

      setRepliesData(allReplies);
    };

    fetchAllReplies();
  }, [comments, expandedComments]);

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/post`,
        {
          postId,
          comment,
          userId,
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      // Also invalidate post data to update comment count
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  // Add reply mutation
  const addReplyMutation = useMutation({
    mutationFn: async ({
      text,
      parentCommentId,
    }: {
      text: string;
      parentCommentId: string;
    }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/replyComment`,
        {
          postId,
          commentId: parentCommentId,
          text,
          userId,
        }
      );
      return { data: response.data.data, parentCommentId };
    },
    onSuccess: (result) => {
      // Invalidate and refetch replies for this specific comment
      queryClient.invalidateQueries({
        queryKey: ["replies", result.parentCommentId],
      });
      // Also invalidate post data to update comment count
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const handleAddReply = async (commentId: string) => {
    const replyInput = replyInputs[commentId];
    if (!replyInput?.text?.trim()) return;

    addReplyMutation.mutate({
      text: replyInput.text,
      parentCommentId: replyInput.parentCommentId,
    });

    // Clear reply input
    setReplyInputs((prev) => ({
      ...prev,
      [commentId]: { text: "", parentCommentId: "" },
    }));
  };

  const handleFetchReplies = async (commentId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      next.add(commentId);
      return next;
    });
  };

  const renderReplyInput = (commentId: string) => (
    <div className="flex gap-2 mt-4 ml-8">
      <Avatar className="h-6 w-6">
        <AvatarImage src={user?.image} />
        <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 relative">
        <input
          type="text"
          value={replyInputs[commentId]?.text || ""}
          onChange={(e) =>
            setReplyInputs((prev) => ({
              ...prev,
              [commentId]: { text: e.target.value, parentCommentId: commentId },
            }))
          }
          placeholder="Write a reply..."
          className="w-full bg-background rounded-full px-4 py-2 text-sm text-accent focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={() => handleAddReply(commentId)}
          disabled={addReplyMutation.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderComments = (commentList: Comment[], level = 0) => {
    return commentList.map((comment, index) => {
      const replies = repliesData[comment._id] || [];

      return (
        <div
          key={`${comment?._id}-${index}`}
          className={`pl-${level * 4} mt-4 border-l border-background`}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-7 w-7">
              <AvatarImage
                src={comment?.postedBy?.image || "/placeholder.svg"}
              />
              <AvatarFallback className="border">
                {comment?.postedBy?.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <strong className="text-muted textsm">
                {comment?.postedBy?.name}
              </strong>
              <span className="text-xs text-accent">
                {new Date(comment?.commentedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="mt-2 text-accent bg-background p-3 rounded-md">
            {comment?.text}
          </div>
          <div className="mt-2 flex gap-4 items-center">
            <button
              className="text-sm text-muted-foreground transition"
              onClick={() => {
                if (!expandedComments.has(comment?._id)) {
                  handleFetchReplies(comment?._id);
                }
                setShowReplyInput((prev) => {
                  const next = new Set(prev);
                  if (prev.has(comment?._id)) {
                    next.delete(comment?._id);
                  } else {
                    next.add(comment?._id);
                  }
                  return next;
                });
              }}
            >
              <Reply className="h-4 w-4 inline-block mr-1" /> Reply
            </button>
          </div>
          {showReplyInput.has(comment?._id) && renderReplyInput(comment?._id)}
          {expandedComments.has(comment?._id) && (
            <div className="ml-6">{renderComments(replies, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  if (isLoading)
    return <div className="p-4 text-center">Loading comments...</div>;
  if (error)
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load comments
      </div>
    );

  return (
    <div className="border-t border-zinc-800/50">
      <div className="p-4">{renderComments(comments)}</div>
    </div>
  );
};

export default CommentSection;
