"use client";
import React, { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ImageIcon, Video, LinkIcon, ChevronDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
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
import { StringConstants } from "../common/CommonText";
import { useCreatePost } from "@/hook/queries/usePostMutations";
import axios from "axios";

interface MediaPreview {
  file: File;
  previewUrl: string;
  type: "image" | "video" | "gif";
}

interface Community {
  id: string;
  name: string;
  user_id: string;
  avatar?: string;
  member_count?: number;
}

export default function PostFromFeed() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [myAllCommunities, setMyAllCommunities] = React.useState<Community[]>(
    []
  );
  const [selectedCommunity, setSelectedCommunity] =
    React.useState<Community | null>(null);
  const [mediaPreview, setMediaPreview] = React.useState<MediaPreview | null>(
    null
  );
  const [tags, setTags] = React.useState<string[]>([]);

  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const gifInputRef = React.useRef<HTMLInputElement>(null);

  const activeCommunity = useSelector(
    (state: any) => state.channel.activeCommunity
  );
  const memberDetails = useSelector((state: any) => state.member.memberDetails);
  const isAdmin = memberDetails?.is_owner || memberDetails?.is_moderator;
  const userID = useSelector((state: any) => state.user.user?._id);
  const { data: session } = useSession();

  const createPostMutation = useCreatePost();

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user/follow`,
          {
            userId: session?.user?._id || userID,
          }
        );

        const communities = res.data.data || [];
        setMyAllCommunities(communities);

        // Set default selected community to active community or first available
        if (activeCommunity) {
          setSelectedCommunity(activeCommunity[0]);
        } else if (communities.length > 0) {
          setSelectedCommunity(communities[0]);
        }
      } catch (error) {
        console.error("Failed to fetch communities:", error);
        setMyAllCommunities([]);
        toast.error("Failed to load communities");
      }
    }

    if (session?.user?._id || userID) {
      fetchCommunities();
    }
  }, [session?.user?._id, userID, activeCommunity]);

  // Filter communities owned by the user
  const myCommunities = myAllCommunities.filter(
    (comm) => comm && comm.user_id === (session?.user?._id || userID)
  );

  // Combine all communities with a special "My Communities" section
  const allAvailableCommunities = [
    ...myCommunities,
    ...myAllCommunities.filter(
      (comm) => comm && comm.user_id === session?.user?._id
    ),
  ];

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

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  React.useEffect(() => {
    return () => {
      if (mediaPreview?.previewUrl) {
        URL.revokeObjectURL(mediaPreview.previewUrl);
      }
    };
  }, [mediaPreview]);

  const handleFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: "image" | "video" | "gif"
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

    const previewUrl = URL.createObjectURL(file);
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
      toast.error("Content is required!");
      return;
    }

    if (!selectedCommunity) {
      toast.error("Please select a community to post to!");
      return;
    }
    console.log("HEllllllll");
    console.log("Selceted Community:", selectedCommunity._id);

    try {
      const contentToSend = JSON.stringify(content);
      await createPostMutation.mutateAsync({
        userId: userID || "",
        communityId: selectedCommunity._id,
        title,
        body: contentToSend,
        tags: tags.length > 0 ? tags : undefined,
        file: mediaPreview?.file,
      });

      toast.success("Post created successfully!");
      setIsOpen(false);
      setContent("");
      setTitle("");
      clearMediaPreview();
      setTags([]);
    } catch (error) {
      console.error("Post creation failed:", error);
      toast.error("Failed to create post. Please try again.");
    }
  };

  const handleCommunitySelect = (community: Community) => {
    setSelectedCommunity(community);
  };

  return (
    <div className="flex  gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 mt-4 mx-4">
      <Avatar className="h-10 w-10">
        <AvatarImage src={session?.user?.image || ""} />
        <AvatarFallback className="bg-blue-100 text-blue-600">
          {session?.user?.name
            ?.split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-3">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <input
              type="text"
              placeholder="What&apos;s on your mind? Share with your community..."
              onClick={() => setIsOpen(true)}
              className=" w-full p-2 rounded-full border  text-gray-600 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </DialogTrigger>

          <DialogContent className="sm:max-w-[650px] bg-white border-gray-200 p-0 max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {session?.user?.name
                        ?.split(" ")
                        .map((word) => word.charAt(0))
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {session?.user?.name || "User Name"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {StringConstants.POSTING_IN}{" "}
                      <span className="font-medium text-blue-600">
                        {selectedCommunity?.name || "Select Community"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Tiptap Editor */}
              <div className="space-y-0">
                <div className="flex items-center gap-1 p-2 bg-gray-50 border border-gray-200 rounded-t-md">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-gray-200"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    disabled={!editor?.can().chain().focus().toggleBold().run()}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-gray-200"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    disabled={
                      !editor?.can().chain().focus().toggleItalic().run()
                    }
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-gray-200"
                    onClick={() =>
                      editor?.chain().focus().toggleUnderline().run()
                    }
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
                    className="h-8 w-8 hover:bg-gray-200"
                    onClick={() =>
                      editor?.chain().focus().toggleBulletList().run()
                    }
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
                    className="h-8 w-8 hover:bg-gray-200"
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
                    className="h-8 w-8 hover:bg-gray-200"
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
                    className="h-8 w-8 hover:bg-gray-200"
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
                    className="h-8 w-8 hover:bg-gray-200"
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
                  className="relative w-full min-h-[200px] border border-gray-200 rounded-b-md bg-white"
                  onClick={() => editor?.commands.focus()}
                >
                  <EditorContent
                    editor={editor}
                    className="w-full h-full p-4 overflow-y-auto text-gray-900 outline-none prose prose-sm max-w-none"
                  />
                  {!content && (
                    <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                     What&apos;s happening in your community?
                    </div>
                  )}
                </div>
              </div>

              {/* File Preview */}
              {mediaPreview && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-3">
                      {mediaPreview.type === "video" && (
                        <video
                          src={mediaPreview.previewUrl}
                          className="h-12 w-12 object-cover rounded border"
                        />
                      )}
                      {(mediaPreview.type === "image" ||
                        mediaPreview.type === "gif") && (
                        <img
                          src={mediaPreview.previewUrl || "/placeholder.svg"}
                          className="h-12 w-12 object-cover rounded border"
                          alt={mediaPreview.file.name}
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {mediaPreview.file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(mediaPreview.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                      onClick={clearMediaPreview}
                    >
                      <span className="text-lg">×</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Upload Buttons */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={imageInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileSelection(e, "image")}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                  disabled={createPostMutation.isPending || !!mediaPreview}
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Photo
                </Button>

                <input
                  type="file"
                  ref={videoInputRef}
                  className="hidden"
                  accept="video/*"
                  onChange={(e) => handleFileSelection(e, "video")}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 px-3 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
                  disabled={createPostMutation.isPending || !!mediaPreview}
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <Button
                  variant="default"
                  className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handlePostCreate}
                  disabled={createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Community Selection Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Post To:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-8 px-3 text-sm bg-white hover:bg-gray-50 border-gray-200"
              >
                <Users className="h-4 w-4 mr-2" />
                {selectedCommunity?.name || "Select Community"}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-white border-gray-200">
              {myCommunities.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    My Communities
                  </DropdownMenuLabel>
                  {myCommunities.map((community) => (
                    <DropdownMenuItem
                      key={community.id}
                      onClick={() => handleCommunitySelect(community)}
                      className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={community.image || "/placeholder.svg"}
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {community.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {community.name}
                          </span>
                        </div>
                      </div>
                      {/* {selectedCommunity?.id === community.id && (
                        <div className="h-2 w-2 bg-blue-600 rounded-full" />
                      )} */}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}
              {allAvailableCommunities.length === 0 && (
                <DropdownMenuItem
                  disabled
                  className="text-center text-gray-500 py-4"
                >
                  No communities available
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
