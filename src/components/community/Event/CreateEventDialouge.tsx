"use client";

import * as React from "react";
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
import { useCreatePost } from "@/hook/queries/usePostMutations";
import { StringConstants } from "@/components/common/CommonText";

interface MediaPreview {
  file: File;
  previewUrl: string;
  type: "image" | "video" | "gif" | "link";
}

export function PostDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [title, setTitle] = React.useState("");
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
  
  // Use the React Query mutation hook
  const createPostMutation = useCreatePost();
  
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
    if (!content) {
      toast.error("content are required!");
      return;
    }

    try {
      await createPostMutation.mutateAsync({
        userId: userID || "",
        communityId: activeCommunityId || "",
        title,
        body: content,
        tags: tags.length > 0 ? tags : undefined,
        file: mediaPreview?.file
      });

      toast.success("Post created successfully!");

      // Reset form
      setIsOpen(false);
      // setTitle("");
      setContent("");
      clearMediaPreview();
      setTags([]);
    } catch (error) {
      console.error("Post creation failed:", error);
      toast.error("Failed to create post. Please try again.");
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
          {StringConstants.CREATE}
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
                <span className="text-maccent">{StringConstants.POSTING_IN}</span>{" "}
                <span className="font-medium">{activeCommunity?.name}</span>
              </span>
            </div>
          </div>

          {/* Post Inputs */}
          {/* <Input
            placeholder="Heading"
            className="p-2 text-lg text-muted placeholder:text-muted focus-visible:ring-0 border border-background bg-card"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          /> */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something..."
            className="min-h-[200px] bg-card border border-background p-2 text-muted placeholder:text-muted focus-visible:ring-0 resize-none"
          />

          {/* Tags Input */}
          {/* <Input
            placeholder="Add tags (comma separated)"
            className="p-2 text-sm text-muted placeholder:text-muted focus-visible:ring-0 border border-background bg-card"
            onChange={(e) => {
              const tagList = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
              setTags(tagList);
            }}
          /> */}

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
              disabled={createPostMutation.isPending || !!mediaPreview}
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
              disabled={createPostMutation.isPending || !!mediaPreview}
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
              disabled={createPostMutation.isPending || !!mediaPreview}
              onClick={() => gifInputRef.current?.click()}
            >
              <Gift />
            </Button>

            {/* Link Upload */}
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
              disabled={createPostMutation.isPending || !!mediaPreview}
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
            disabled={createPostMutation.isPending}
          >
            {createPostMutation.isPending ? "Posting..." : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}