"use client";

import * as React from "react";
import { Plus, Image, Video, LinkIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useCreatePost } from "@/hook/queries/usePostMutations";
import { StringConstants } from "@/components/common/CommonText";
import Link from "@tiptap/extension-link"; // Import the correct Link extension
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
} from "lucide-react";

interface MediaPreview {
  file: File;
  previewUrl: string;
  type: "image" | "video" | "gif" | "link";
}

export function PostDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [mediaPreview, setMediaPreview] = React.useState<MediaPreview | null>(
    null
  );
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

    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        "File size exceeds 20MB limit. Please upload a smaller file."
      );

      event.target.value = "";
      return;
    }

    // Create a preview URL for the selected file
    const previewUrl = URL.createObjectURL(file);

    // Store the file and preview URL
    setMediaPreview({
      file,
      previewUrl,
      type: fileType,
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
      toast.error("Content are required!");
      return;
    }

    try {
      // Stringify the HTML content if needed
      const contentToSend = JSON.stringify(content);

      await createPostMutation.mutateAsync({
        userId: userID || "",
        communityId: activeCommunityId || "",
        title,
        body: contentToSend,
        tags: tags.length > 0 ? tags : undefined,
        file: mediaPreview?.file,
      });

      toast.success("Post created successfully!");

      // Reset form
      setIsOpen(false);
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

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
    },
  });

  // Update editor content when content state changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

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
                <span className="text-maccent">
                  {StringConstants.POSTING_IN}
                </span>{" "}
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

          <div className="space-y-0">
            <div className="flex items-center gap-2 p-2 bg-card border border-background rounded-t-md">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                disabled={!editor?.can().chain().focus().toggleBold().run()}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                disabled={!editor?.can().chain().focus().toggleItalic().run()}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                disabled={
                  !editor?.can().chain().focus().toggleUnderline().run()
                }
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                disabled={
                  !editor?.can().chain().focus().toggleBulletList().run()
                }
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() =>
                  editor?.chain().focus().setTextAlign("left").run()
                }
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() =>
                  editor?.chain().focus().setTextAlign("center").run()
                }
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() =>
                  editor?.chain().focus().setTextAlign("right").run()
                }
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => {
                  const url = window.prompt("URL");
                  if (url) {
                    editor?.chain().focus().setLink({ href: url }).run();
                  }
                }}
                disabled={
                  !editor?.can().chain().focus().setLink({ href: "" }).run()
                }
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
            <div
              className="relative w-full h-[270px] border border-gray-300 rounded-md"
              onClick={() => editor?.commands.focus()}
            >
              <EditorContent
                editor={editor}
                className="w-full h-full p-2 overflow-y-auto bg-white text-black outline-none"
              />
            </div>
          </div>

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
                  {(mediaPreview.type === "image" ||
                    mediaPreview.type === "gif") && (
                    <img
                      src={mediaPreview.previewUrl || "/placeholder.svg"}
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
            {/* <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-lg bg-pink-200 hover:bg-pink-300 text-pink-700"
              disabled={createPostMutation.isPending || !!mediaPreview}
              onClick={() => gifInputRef.current?.click()}
            >
              <Gift />
            </Button> */}

            {/* Link Upload */}
            {/* <input
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
            </Button> */}
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
