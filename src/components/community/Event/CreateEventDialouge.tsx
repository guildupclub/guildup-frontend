// "use client";

// import * as React from "react";
// import axios from "axios";
// import { Link2, Smile, Plus, Image, Video, Gift, Link } from "lucide-react"; // Import necessary icons
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { useSession } from "next-auth/react";
// import { toast } from "sonner";
// import { useSelector } from "react-redux";
// import { RootState } from "@/redux/store";

// interface FileResponse {
//   signedUrl: string;
//   fileId: string;
//   key: string;
//   publicUrl: string;
// }

// interface MediaData {
//   fileName: string;
//   fileType: string;
//   fileId: string;
//   key: string;
//   publicUrl: string;
// }

// export function PostDialog() {
//   const mediaRef = React.useRef<MediaData | null>(null);
//   const [isOpen, setIsOpen] = React.useState(false);
//   const [content, setContent] = React.useState("");
//   const [title, setTitle] = React.useState("");
//   const [isUploading, setIsUploading] = React.useState(false);

//   const imageInputRef = React.useRef<HTMLInputElement>(null);
//   const videoInputRef = React.useRef<HTMLInputElement>(null);
//   const gifInputRef = React.useRef<HTMLInputElement>(null);
//   const linkInputRef = React.useRef<HTMLInputElement>(null);

//   const activeCommunity = useSelector(
//     (state: RootState) => state.channel.activeCommunity
//   );
//   const memberDetails = useSelector(
//     (state: RootState) => state.member.memberDetails
//   );
//   const isAdmin = memberDetails?.is_owner || memberDetails?.is_moderator;

//   const activeCommunityId = activeCommunity?.id;
//   console.log(activeCommunityId);
//   const userID = useSelector((state: RootState) => state.user.user?._id);

//   const sessionId = useSelector((state: RootState) => state.user.sessionId);

//   const { data: session } = useSession();
//   const userId = userID;
//   const communityId = activeCommunityId;
//   const sessionToken = sessionId;

//   const handleFileUpload = async (
//     event: React.ChangeEvent<HTMLInputElement>,
//     fileType: "image" | "video" | "gif" | "link"
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file && fileType !== "link") return;

//     setIsUploading(true);
//     try {
//       const signUrlResponse = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/getGCPSignUrl`,
//         {
//           fileName: file?.name || "",
//           fileType,
//           userId,
//           communityId,
//         }
//       );
//       const { signedUrl, fileId, key, publicUrl } = signUrlResponse.data.data;

//       console.log(signedUrl, fileId, key, publicUrl);
//       const responseData = signUrlResponse.data.data;

//       // Step 2: Upload to S3 if it's a file (not a link)
//       if (fileType !== "link" && file) {
//         await axios.put(responseData.signedUrl, file, {
//           headers: { "Content-Type": file.type },
//         });
//         console.log("File uploaded to S3 successfully");
//       }

//       // Step 3: Store media data
//       const newMediaData = {
//         fileName: file?.name || "Link",
//         fileType,
//         fileId: responseData.fileId,
//         key: responseData.key,
//         publicUrl:
//           fileType === "link" ? file?.name || "" : responseData.publicUrl,
//       };

//       //@ts-nocheck
//       mediaRef.current = newMediaData;

//       // Force re-render
//       setIsUploading(false);
//     } catch (error) {
//       console.error("Upload failed:", error);
//       mediaRef.current = null;
//       setIsUploading(false);
//     }
//   };


//   const handlePostCreate = async () => {
//     if (!title || !content) {
//       alert("Title and content are required!");
//       return;
//     }


//     // Create the media object
//     const mediaPayload = mediaRef.current
//       ? {
//           fileName: mediaRef.current.fileName,
//           fileType: mediaRef.current.fileType,
//           fileId: mediaRef.current.fileId,
//           key: mediaRef.current.key,
//           publicUrl: mediaRef.current.publicUrl,
//         }
//       : null;


//     const postPayload = {
//       userId,
//       session: sessionToken,
//       type: "close",
//       communityId,
//       slug: title,
//       title,
//       body: content,
//       is_locked: false,
//       media: mediaPayload,
//     };

//     console.log("Post payload before API call:", postPayload);

//     try {
//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/create`,
//         JSON.stringify(postPayload),
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log("Post created successfully:", response.data);

//       // Show toast after successful post creation
//       toast.success("Post created successfully!");

//       setIsOpen(false);
//       setTitle("");
//       setContent("");
//       mediaRef.current = null;
//     } catch (error) {
//       console.error("Post creation failed:", error);
//       alert("Failed to create post. Please try again.");
//     }
//   };

//   return (
//     <Dialog
//       open={isOpen}
//       onOpenChange={(newOpen) => {
//         if (!newOpen) {
//           mediaRef.current = null;
//         }
//         setIsOpen(newOpen);
//       }}
//     >
//       <DialogTrigger asChild>
//         <button
//           className={`flex items-center gap-2  text-accent ${
//             !isAdmin ? "opacity-50 cursor-not-allowed" : ""
//           }`}
//           disabled={!isAdmin}
//         >
//           <div
//             className={`rounded-md bg-card text-accent mx-2 ${
//               isAdmin ? "hover:bg-background" : ""
//             }`}
//           >
//             <Plus />
//           </div>
//           Create
//         </button>
//       </DialogTrigger>

//       <DialogContent className="sm:max-w-[600px] bg-background border-background p-0">
//         <div className="p-4 space-y-3">
//           {/* Header */}
//           <div className="flex items-start justify-between">
//             <div className="flex items-center gap-3">
//               <Avatar className="h-10 w-10">
//                 <AvatarImage src={session?.user?.image || ""} />
//                 <AvatarFallback>AR</AvatarFallback>
//               </Avatar>
//               <span className="text-muted">
//                 {session?.user?.name || "User Name"}{" "}
//                 <span className="text-maccent">posting in</span>{" "}
//                 <span className="font-medium">Technology</span>
//               </span>
//             </div>
//             {/* <Button
//               variant="ghost"
//               size="icon"
//               className="h-8 w-8 text-zinc-300 hover:text-zinc-600"
//               onClick={() => setIsOpen(false)}
//             >
//               <X className="h-5 w-5" />
//             </Button> */}
//           </div>

//           {/* Post Inputs */}
//           <Input
//             placeholder="Heading"
//             className="p-2 text-lg text-muted placeholder:text-mutedfocus-visible:ring-0 border border-background bg-card"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//           />
//           <Textarea
//             value={content}
//             onChange={(e) => setContent(e.target.value)}
//             placeholder="Write something..."
//             className="min-h-[200px] bg-card border border-background p-2 text-muted placeholder:text-mutedfocus-visible:ring-0 resize-none"
//           />

//           {/* File Preview */}
//           {mediaRef.current && (
//             <div className="space-y-2">
//               <div className="flex items-center justify-between p-2 rounded-lg bg-card">
//                 <div className="flex items-center gap-2">
//                   {mediaRef.current.fileType.includes("video") && (
//                     <video
//                       src={mediaRef.current.publicUrl}
//                       className="h-10 w-10 object-cover rounded"
//                     />
//                   )}
//                   {mediaRef.current.fileType.includes("image") && (
//                     <img
//                       src={mediaRef.current.publicUrl}
//                       className="h-10 w-10 object-cover rounded"
//                       alt={mediaRef.current.fileName}
//                     />
//                   )}
//                   {mediaRef.current.fileType.includes("gif") && (
//                     <img
//                       src={mediaRef.current.publicUrl}
//                       className="h-10 w-10 object-cover rounded"
//                       alt={mediaRef.current.fileName}
//                     />
//                   )}
//                   <span className="text-sm text-zinc-400">
//                     {mediaRef.current.fileName}
//                   </span>
//                 </div>
//                 {/* <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-6 w-6 text-zinc-400 hover:text-zinc-200"
//                   onClick={() => {
//                     mediaRef.current = null;
//                     setIsUploading((prev) => !prev); // Force re-render
//                   }}
//                 >
//                   <X className="h-4 w-4" />
//                 </Button> */}
//               </div>
//             </div>
//           )}

//           {/* Upload Buttons */}
//           <div className="flex items-center gap-3">
//             {/* Image Upload */}
//             <input
//               type="file"
//               ref={imageInputRef}
//               className="hidden"
//               accept="image/*"
//               onChange={(e) => handleFileUpload(e, "image")}
//             />
//             <Button
//               size="icon"
//               variant="ghost"
//               className="h-10 w-10 rounded-lg bg-purple-200 hover:bg-purple-300 text-purple-700"
//               disabled={isUploading}
//               onClick={() => imageInputRef.current?.click()}
//             >
//               {isUploading ? "⏳" : <Image />}
//             </Button>

//             {/* Video Upload */}
//             <input
//               type="file"
//               ref={videoInputRef}
//               className="hidden"
//               accept="video/*"
//               onChange={(e) => handleFileUpload(e, "video")}
//             />
//             <Button
//               size="icon"
//               variant="ghost"
//               className="h-10 w-10 rounded-lg bg-green-200 hover:bg-green-300 text-green-700"
//               disabled={isUploading}
//               onClick={() => videoInputRef.current?.click()}
//             >
//               {isUploading ? "⏳" : <Video />}
//             </Button>

//             {/* GIF Upload */}
//             <input
//               type="file"
//               ref={gifInputRef}
//               className="hidden"
//               accept="image/gif"
//               onChange={(e) => handleFileUpload(e, "gif")}
//             />
//             <Button
//               size="icon"
//               variant="ghost"
//               className="h-10 w-10 rounded-lg bg-pink-200 hover:bg-pink-300 text-pink-700"
//               disabled={isUploading}
//               onClick={() => gifInputRef.current?.click()}
//             >
//               {isUploading ? "⏳" : <Gift />}
//             </Button>

//             {/* Link Upload */}
//             <input
//               type="file"
//               ref={linkInputRef}
//               className="hidden"
//               onChange={(e) => handleFileUpload(e, "link")}
//             />
//             <Button
//               size="icon"
//               variant="ghost"
//               className="h-10 w-10 rounded-lg bg-blue-200 hover:bg-blue-300 text-blue-700"
//               disabled={isUploading}
//               onClick={() => linkInputRef.current?.click()}
//             >
//               {isUploading ? "⏳" : <Link />}
//             </Button>
//           </div>

//           {/* Submit Button */}
//           <Button
//             variant="default"
//             className="w-full text-white"
//             onClick={handlePostCreate}
//           >
//             Post
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }


"use client";

import * as React from "react";
import axios from "axios";
import { Link2, Smile, Plus, Image, Video, Gift, Link } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface MediaPreview {
  file: File;
  previewUrl: string;
  type: "image" | "video" | "gif" | "link";
}

export function PostDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [mediaPreview, setMediaPreview] = React.useState<MediaPreview | null>(null);
  const [tags, setTags] = React.useState<string[]>([]);

  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const gifInputRef = React.useRef<HTMLInputElement>(null);
  const linkInputRef = React.useRef<HTMLInputElement>(null);

  const activeCommunity = useSelector(
    (state: RootState) => state.channel.activeCommunity
  );
  const memberDetails = useSelector(
    (state: RootState) => state.member.memberDetails
  );
  const isAdmin = memberDetails?.is_owner || memberDetails?.is_moderator;

  const activeCommunityId = activeCommunity?.id;
  const userID = useSelector((state: RootState) => state.user.user?._id);

  const { data: session } = useSession();
  
  const handleFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: "image" | "video" | "gif" | "link"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a preview URL for the selected file
    const previewUrl = URL.createObjectURL(file);
    
    // Store the file and preview URL
    setMediaPreview({
      file,
      previewUrl,
      type: fileType
    });
  };

  const clearMediaPreview = () => {
    if (mediaPreview?.previewUrl) {
      URL.revokeObjectURL(mediaPreview.previewUrl);
    }
    setMediaPreview(null);
  };

  const handlePostCreate = async () => {
    if (!title || !content) {
      toast.error("Title and content are required!");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("userId", userID || "");
      formData.append("communityId", activeCommunityId || "");
      formData.append("title", title);
      formData.append("body", content);
      
      // Add tags if any
      if (tags.length > 0) {
        formData.append("tags", JSON.stringify(tags));
      }

      // Add file if selected
      if (mediaPreview?.file) {
        formData.append("file", mediaPreview.file);
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Post created successfully:", response.data);
      toast.success("Post created successfully!");

      // Reset form
      setIsOpen(false);
      setTitle("");
      setContent("");
      clearMediaPreview();
      setTags([]);
    } catch (error) {
      console.error("Post creation failed:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle cleanup when dialog closes
  React.useEffect(() => {
    return () => {
      if (mediaPreview?.previewUrl) {
        URL.revokeObjectURL(mediaPreview.previewUrl);
      }
    };
  }, [mediaPreview]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          clearMediaPreview();
        }
        setIsOpen(newOpen);
      }}
    >
      <DialogTrigger asChild>
        <button
          className={`flex items-center gap-2 text-accent ${
            !isAdmin ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!isAdmin}
        >
          <div
            className={`rounded-md bg-card text-accent mx-2 ${
              isAdmin ? "hover:bg-background" : ""
            }`}
          >
            <Plus />
          </div>
          Create
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] bg-background border-background p-0">
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
              <span className="text-muted">
                {session?.user?.name || "User Name"}{" "}
                <span className="text-maccent">posting in</span>{" "}
                <span className="font-medium">{activeCommunity?.name || "Community"}</span>
              </span>
            </div>
          </div>

          {/* Post Inputs */}
          <Input
            placeholder="Heading"
            className="p-2 text-lg text-muted placeholder:text-muted focus-visible:ring-0 border border-background bg-card"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something..."
            className="min-h-[200px] bg-card border border-background p-2 text-muted placeholder:text-muted focus-visible:ring-0 resize-none"
          />

          {/* Tags Input */}
          <Input
            placeholder="Add tags (comma separated)"
            className="p-2 text-sm text-muted placeholder:text-muted focus-visible:ring-0 border border-background bg-card"
            onChange={(e) => {
              const tagList = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
              setTags(tagList);
            }}
          />

          {/* File Preview */}
          {mediaPreview && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-card">
                <div className="flex items-center gap-2">
                  {mediaPreview.type === "video" && (
                    <video
                      src={mediaPreview.previewUrl}
                      className="h-10 w-10 object-cover rounded"
                    />
                  )}
                  {(mediaPreview.type === "image" || mediaPreview.type === "gif") && (
                    <img
                      src={mediaPreview.previewUrl}
                      className="h-10 w-10 object-cover rounded"
                      alt={mediaPreview.file.name}
                    />
                  )}
                  <span className="text-sm text-zinc-400">
                    {mediaPreview.file.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-zinc-400 hover:text-zinc-200"
                  onClick={clearMediaPreview}
                >
                  <span>×</span>
                </Button>
              </div>
            </div>
          )}

          {/* Upload Buttons */}
          <div className="flex items-center gap-3">
            {/* Image Upload */}
            <input
              type="file"
              ref={imageInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileSelection(e, "image")}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-lg bg-purple-200 hover:bg-purple-300 text-purple-700"
              disabled={isUploading || !!mediaPreview}
              onClick={() => imageInputRef.current?.click()}
            >
              <Image />
            </Button>

            {/* Video Upload */}
            <input
              type="file"
              ref={videoInputRef}
              className="hidden"
              accept="video/*"
              onChange={(e) => handleFileSelection(e, "video")}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-lg bg-green-200 hover:bg-green-300 text-green-700"
              disabled={isUploading || !!mediaPreview}
              onClick={() => videoInputRef.current?.click()}
            >
              <Video />
            </Button>

            {/* GIF Upload */}
            <input
              type="file"
              ref={gifInputRef}
              className="hidden"
              accept="image/gif"
              onChange={(e) => handleFileSelection(e, "gif")}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-lg bg-pink-200 hover:bg-pink-300 text-pink-700"
              disabled={isUploading || !!mediaPreview}
              onClick={() => gifInputRef.current?.click()}
            >
              <Gift />
            </Button>

            {/* Link Upload - We'll keep this for compatibility but adjust implementation */}
            <input
              type="text"
              ref={linkInputRef}
              className="hidden"
              onChange={(e) => {
                // This would need to be implemented differently for links
                // as they're not files
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-lg bg-blue-200 hover:bg-blue-300 text-blue-700"
              disabled={isUploading || !!mediaPreview}
              onClick={() => {
                const link = prompt("Enter link URL:");
                if (link) {
                  // Handle link differently - perhaps store it in state
                  // or add to the content
                  setContent(prev => prev + "\n\n" + link);
                }
              }}
            >
              <Link />
            </Button>
          </div>

          {/* Submit Button */}
          <Button
            variant="default"
            className="w-full text-white"
            onClick={handlePostCreate}
            disabled={isUploading}
          >
            {isUploading ? "Posting..." : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}