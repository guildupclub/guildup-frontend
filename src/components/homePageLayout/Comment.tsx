// "use client"

// import { useState } from "react"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Button } from "@/components/ui/button"
// import { Heart, MessageCircle, Plus, Send } from "lucide-react"
// import { useMutation, useQueryClient } from "@tanstack/react-query"
// import axios from "axios"
// import { useSelector } from "react-redux"
// import type { RootState } from "@/redux/store"
// import { ref, push, update } from "firebase/database"
// import database from "../../firebase"
// import { removeSpecialCharacters } from "../utils/StringUtils"

// interface CommentProps {
//   author: string
//   level: number
//   content: string
//   timestamp: string
//   likes: number
//   commentId: string
//   postId: string
//   authorId: string 
//   replies?: CommentProps[]
// }

// export function Comment({
//   author,
//   level,
//   content,
//   timestamp,
//   likes,
//   commentId,
//   postId,
//   authorId,
//   replies,
// }: CommentProps) {
//   const [isLiked, setIsLiked] = useState(false)
//   const [isReplying, setIsReplying] = useState(false)
//   const [replyText, setReplyText] = useState("")
//   const queryClient = useQueryClient()
//   const userId = useSelector((state: RootState) => state.user.user?._id)
//   const user = useSelector((state: RootState) => state.user.user)

//   // Like comment mutation
//   const likeMutation = useMutation({
//     mutationFn: async () => {
//       const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/comment/like`, {
//         commentId,
//         userId,
//       })
//       return response.data
//     },
//     onSuccess: async () => {
//       // Update UI state
//       setIsLiked(true)

//       // Send notification if the comment is not by the current user
//       if (authorId && authorId !== userId) {
//         try {
//           // Get the comment author's email
//           const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/user/${authorId}`)
//           const authorEmail = response.data.email

//           if (authorEmail) {
//             const email = removeSpecialCharacters(authorEmail)

//             // Create notification in Firebase
//             const notificationsRef = ref(database, `notification/${email}`)
//             const newNotificationRef = push(notificationsRef)

//             await update(newNotificationRef, {
//               type: "comment_like",
//               message: `${user.name} liked your comment`,
//               read: false,
//               createdAt: new Date().toISOString(),
//               data: {
//                 postId,
//                 commentId,
//                 userId: user._id,
//                 userName: user.name,
//                 userImage: user.image,
//               },
//             })
//           }
//         } catch (error) {
//           console.error("Error sending comment like notification:", error)
//         }
//       }
//     },
//   })

//   // Add reply mutation
//   const replyMutation = useMutation({
//     mutationFn: async (text: string) => {
//       const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/replyComment`, {
//         postId,
//         commentId,
//         text,
//         userId,
//       })
//       return response.data.data
//     },
//     onSuccess: async (data) => {
//       // Invalidate and refetch comments and replies
//       queryClient.invalidateQueries({ queryKey: ["replies", commentId] })
//       queryClient.invalidateQueries({ queryKey: ["comments", postId] })
//       // Also invalidate post data to update comment count
//       queryClient.invalidateQueries({ queryKey: ["post", postId] })

//       // Send notification to comment author if it's not the same user
//       if (authorId && authorId !== userId) {
//         try {
//           // Get the comment author's email
//           const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/user/${authorId}`)
//           const authorEmail = response.data.email

//           if (authorEmail) {
//             const email = removeSpecialCharacters(authorEmail)

//             // Create notification in Firebase
//             const notificationsRef = ref(database, `notification/${email}`)
//             const newNotificationRef = push(notificationsRef)

//             await update(newNotificationRef, {
//               type: "comment_reply",
//               message: `${user.name} replied to your comment: "${replyText.substring(0, 50)}${replyText.length > 50 ? "..." : ""}"`,
//               read: false,
//               createdAt: new Date().toISOString(),
//               data: {
//                 postId,
//                 commentId,
//                 replyId: data._id,
//                 userId: user._id,
//                 userName: user.name,
//                 userImage: user.image,
//               },
//             })
//           }
//         } catch (error) {
//           console.error("Error sending reply notification:", error)
//         }
//       }
//     },
//   })

//   const handleReplySubmit = () => {
//     if (!replyText.trim()) return

//     replyMutation.mutate(replyText)
//     setReplyText("")
//     setIsReplying(false)
//   }

//   const handleLikeClick = () => {
//     if (isLiked) return // Prevent multiple likes
//     likeMutation.mutate()
//   }

//   return (
//     <div className="group">
//       <div className="flex gap-3 py-3">
//         <Avatar className="h-8 w-8">
//           <AvatarImage src={user?.image || "/placeholder.svg"} />
//           <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
//         </Avatar>
//         <div className="flex-1">
//           <div className="flex items-center gap-2">
//             <span className="font-medium text-muted">{author}</span>
//             <span className="text-xs text-accent">Level {level}</span>
//             <span className="text-xs text-accent">{timestamp}</span>
//           </div>
//           <p className="text-sm text-accent mt-1">{content}</p>
//           <div className="flex items-center gap-4 mt-2">
//             <button onClick={handleLikeClick} className="flex items-center gap-1 text-accent">
//               <Heart className={`h-4 w-4 ${isLiked ? "text-red-500 fill-red-500" : ""}`} />
//               <span className="text-xs">{likes}</span>
//             </button>
//             <button onClick={() => setIsReplying(!isReplying)} className="text-xs text-accent">
//               Reply
//             </button>
//           </div>

//           {isReplying && (
//             <div className="mt-3 flex gap-2">
//               <Avatar className="h-8 w-8">
//                 <AvatarImage src={user?.image || "/placeholder.svg"} />
//                 <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
//               </Avatar>
//               <div className="flex-1 relative">
//                 <input
//                   type="text"
//                   value={replyText}
//                   onChange={(e) => setReplyText(e.target.value)}
//                   placeholder="Write a reply..."
//                   className="w-full bg-background rounded-full px-4 py-2 text-sm text-accent focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 />
//                 <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
//                   <Button variant="ghost" size="icon" className="h-8 w-8 text-accent">
//                     <Plus className="h-4 w-4" />
//                   </Button>
//                   <Button variant="ghost" size="icon" className="h-8 w-8 text-accent">
//                     <MessageCircle className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-8 w-8 text-purple-500"
//                     onClick={handleReplySubmit}
//                     disabled={replyMutation.isPending}
//                   >
//                     <Send className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {replies && replies.length > 0 && (
//         <div className="ml-11 border-l-2 border-zinc-800">
//           <div className="pl-4">
//             {replies.map((reply, index) => (
//               <Comment key={index} {...reply} />
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
