import React, { useState, useEffect } from "react";
import axios from "axios";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Send } from "lucide-react";

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


const CommentSection: React.FC<any> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedReplies, setLoadedReplies] = useState<Set<string>>(new Set());
  const [nestedComments, setNestedComments] = useState<{ [key: string]: Comment[] }>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: ReplyInput }>({});
  const [showReplyInput, setShowReplyInput] = useState<Set<string>>(new Set());

  const handleAddReply = async (commentId: string) => {
    const replyInput = replyInputs[commentId];
    if (!replyInput?.text?.trim()) return;
  
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/replyComment`,
        {
          postId,
          commentId: replyInput.parentCommentId,
          text: replyInput.text,
          userId: "678ce60732c37c1222f913e0",
        }
      );
  
      setNestedComments(prev => ({
        ...prev,
        [replyInput.parentCommentId]: [...(prev[replyInput.parentCommentId] || []), response.data.data]
      }));
  
      // Clear reply input
      setReplyInputs(prev => ({ ...prev, [commentId]: { text: '', parentCommentId: '' } }));
      
    } catch (err) {
      setError("Failed to add reply");
    } finally {
      setLoading(false);
    }
  };

  
  console.log("@prostId", postId);
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/getComments`,
          {
            postId: postId,
            page: 0,
            userId: "678ce60732c37c1222f913e0",
          }
        );
        console.log("@reponseCOmments", response.data);
        setComments(response.data.data);
      } catch (err) {
        setError("Failed to load comments");
      }
    };

    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/post`,
        {
          postId,
          content: newComment,
        }
      );

      setComments((prevComments) => [...prevComments, response.data.data]);
      setNewComment("");
    } catch (err) {
      setError("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchReplies = async (commentId: string) => {
    console.log("@commentID",commentId)
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/getNestedComment`,
        {
          postId: postId,
          parentComment: commentId,
          userId: "678ce60732c37c1222f913e0",
        }
      );
      console.log("@CommentData", response.data);
      setNestedComments(prev => ({
        ...prev,
        [commentId]: response.data.data
      }));
      setExpandedComments(prev => new Set([...prev, commentId]));
   
    } catch (err) {
      setError("Failed to load replies");
    }
  };

  const renderReplyInput = (commentId: string) => (
    <div className="flex gap-2 mt-4 ml-8">
      <Avatar className="h-6 w-6">
        <AvatarImage src="/placeholder.svg" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      <div className="flex-1 relative">
      <input
        type="text"
        value={replyInputs[commentId]?.text || ''}
        onChange={(e) => setReplyInputs(prev => ({
          ...prev,
          [commentId]: { text: e.target.value, parentCommentId:commentId }
        }))}
        placeholder="Write a reply..."
        className="w-full bg-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={() => handleAddReply(commentId)}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderComments = (comments: Comment[], level = 0) => {
    console.log("@commentREnderData",comments)
    return comments.map((comment) => (
      <div key={comment._id} className="pl-[20px] mt-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={comment.postedBy?.avatar || "/placeholder.svg"} />
            <AvatarFallback>{comment.postedBy?.user_name}</AvatarFallback>
          </Avatar>
          <strong>{comment.postedBy?.user_name}</strong>
          <span className="text-sm text-zinc-400">
            {new Date(comment.commentedAt).toLocaleDateString()}
          </span>
        </div>
        <div className="mt-2 text-zinc-200">{comment.text}</div>
        <div className="mt-2 flex gap-4">
        <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!expandedComments.has(comment._id)) {
                handleFetchReplies(comment._id);
              }
              setShowReplyInput(prev => {
                const next = new Set(prev);
                if (prev.has(comment._id)) {
                  next.delete(comment._id);
                } else {
                  next.add(comment._id);
                }
                return next;
              });
            }}
          >
            Reply
          </Button>
        </div>
        {showReplyInput.has(comment._id) && renderReplyInput(comment._id)}
        {expandedComments.has(comment._id) && nestedComments[comment._id] && (
          <div className="ml-4">
            {renderComments(nestedComments[comment._id])}
          </div>
        )}
        </div>
    ));
  };

  return (
    <div className="border-t border-zinc-800/50">
      <div className="p-4">
        {error && <div className="error">{error}</div>}
        {renderComments(comments)}
        <div className="flex gap-2 mt-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full bg-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-zinc-300"
                onClick={handleAddComment}
                disabled={loading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
