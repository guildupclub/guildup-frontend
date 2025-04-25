"use client"
import * as React from "react"
import { ImageIcon, Video, LinkIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import Link from "@tiptap/extension-link"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import axios from "axios"
import { Bold, Italic, UnderlineIcon, AlignLeft, AlignCenter, AlignRight, List } from "lucide-react"

interface MediaPreview {
  file: File
  previewUrl: string
  type: "image" | "video" | "gif" | "link"
}

interface EditPostProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  postToEdit: {
    _id: string
    title: string
    body: string
    media?: {
      publicUrl: string
      fileType: string
    }
  } | null
  postId: string
  onPostUpdated?: (updatedPost: any) => void
}

export function EditPost({ isOpen, setIsOpen, postId, postToEdit, onPostUpdated }: EditPostProps) {
  const [content, setContent] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [mediaPreview, setMediaPreview] = React.useState<MediaPreview | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isFetching, setIsFetching] = React.useState(false)
  const [editorReady, setEditorReady] = React.useState(false)

  const imageInputRef = React.useRef<HTMLInputElement>(null)
  const videoInputRef = React.useRef<HTMLInputElement>(null)
  const gifInputRef = React.useRef<HTMLInputElement>(null)

  const activeCommunity = useSelector((state: RootState) => state.channel.activeCommunity)
  const memberDetails = useSelector((state: RootState) => state.member.memberDetails)
  const isAdmin = memberDetails?.is_owner || memberDetails?.is_moderator

  const activeCommunityId = activeCommunity?.id
  const userID = useSelector((state: RootState) => state.user.user?._id)

  const { data: session } = useSession()

  // Initialize editor
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
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setContent(html)
    },
    onReady: () => {
      setEditorReady(true)
    },
  })

  // Track if we've loaded content into the editor
  const contentLoadedRef = React.useRef(false)

  // Fetch post data when dialog opens
  React.useEffect(() => {
    const fetchPostData = async () => {
      if (isOpen && postId) {
        setIsFetching(true)
        contentLoadedRef.current = false

        try {
          console.log("Fetching post data for ID:", postId)
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/${postId}`)

          console.log("Post data response:", response.data)
          const postData = response.data.data.post

          if (!postData) {
            console.error("No post data found in response")
            toast.error("Failed to load post data")
            return
          }

          // Set title
          setTitle(postData.title || "")

          // Handle the body content - it's likely double-encoded JSON
          let parsedBody = postData.body
          try {
            // First, try to parse it as JSON
            if (typeof parsedBody === "string") {
              // Remove outer quotes if they exist
              if (parsedBody.startsWith('"') && parsedBody.endsWith('"')) {
                parsedBody = JSON.parse(parsedBody)
              }

              // If it's still a string and looks like HTML, use it directly
              if (typeof parsedBody === "string" && !parsedBody.startsWith("{")) {
                setContent(parsedBody)
              } else {
                // If it's an object, stringify it for display
                setContent(typeof parsedBody === "object" ? JSON.stringify(parsedBody) : parsedBody)
              }
            }
          } catch (e) {
            console.error("Error parsing post body:", e)
            // If parsing fails, use the raw body
            setContent(postData.body || "")
          }

          console.log("Parsed content:", parsedBody)

          // Handle media if present
          if (postData.media?.publicUrl) {
            setMediaPreview({
              file: null as any, // We don't have the file object for existing media
              previewUrl: postData.media.publicUrl,
              type: postData.media.fileType as "image" | "video" | "gif" | "link",
            })
          }
        } catch (error) {
          console.error("Error fetching post data:", error)
          toast.error("Failed to load post data for editing")
        } finally {
          setIsFetching(false)
        }
      }
    }

    fetchPostData()
  }, [isOpen, postId])

  // Update editor content when editor is ready and content is available
  React.useEffect(() => {
    if (editor && editorReady && content && !contentLoadedRef.current && !isFetching) {
      console.log("Setting editor content:", content)
      editor.commands.setContent(content)
      contentLoadedRef.current = true
    }
  }, [editor, editorReady, content, isFetching])

  const handleFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: "image" | "video" | "gif" | "link",
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const MAX_FILE_SIZE = 20 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 20MB limit. Please upload a smaller file.")

      event.target.value = ""
      return
    }

    // Create a preview URL for the selected file
    const previewUrl = URL.createObjectURL(file)

    // Store the file and preview URL
    setMediaPreview({
      file,
      previewUrl,
      type: fileType,
    })
  }

  const clearMediaPreview = () => {
    if (mediaPreview?.previewUrl && mediaPreview.file) {
      URL.revokeObjectURL(mediaPreview.previewUrl)
    }
    setMediaPreview(null)
  }

  const handleSubmit = async () => {
    if (!editor || !editor.getHTML()) {
      toast.error("Content is required!")
      return
    }

    if (!postId) {
      toast.error("No post to edit!")
      return
    }

    setIsLoading(true)

    try {
      // Get the current HTML content from the editor
      const editorContent = editor.getHTML()

      // Stringify the HTML content
      const contentToSend = JSON.stringify(editorContent)

      console.log("Submitting content:", contentToSend)

      // Update existing post
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/edit`,
        {
          userId: userID,
          postId: postId,
          communityId: activeCommunityId,
          body: contentToSend,
          title: title || undefined,
          // Only include file if a new one was selected
          ...(mediaPreview?.file ? { file: mediaPreview.file } : {}),
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      )

      toast.success("Post updated successfully!")

      // Notify parent component about the update
      if (onPostUpdated && response.data.data) {
        onPostUpdated(response.data.data)
      }

      // Reset form and close dialog
      setIsOpen(false)
      clearMediaPreview()
    } catch (error) {
      console.error("Post update failed:", error)
      toast.error("Failed to update post. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle cleanup when dialog closes
  React.useEffect(() => {
    return () => {
      if (mediaPreview?.previewUrl && mediaPreview.file) {
        URL.revokeObjectURL(mediaPreview.previewUrl)
      }
    }
  }, [mediaPreview])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          clearMediaPreview()
          contentLoadedRef.current = false
        }
        setIsOpen(newOpen)
      }}
    >
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
                {session?.user?.name || "User Name"} <span className="text-maccent">Editing post in</span>{" "}
                <span className="font-medium">{activeCommunity?.name}</span>
              </span>
            </div>
          </div>

          {/* Editor Toolbar */}
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
                disabled={!editor?.can().chain().focus().toggleUnderline().run()}
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                disabled={!editor?.can().chain().focus().toggleBulletList().run()}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => editor?.chain().focus().setTextAlign("left").run()}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => editor?.chain().focus().setTextAlign("center").run()}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => editor?.chain().focus().setTextAlign("right").run()}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => {
                  const url = window.prompt("URL")
                  if (url) {
                    editor?.chain().focus().setLink({ href: url }).run()
                  }
                }}
                disabled={!editor?.can().chain().focus().setLink({ href: "" }).run()}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Editor Content */}
            <div
              className="relative w-full h-[270px] border border-gray-300 rounded-md"
              onClick={() => editor?.commands.focus()}
            >
              {isFetching ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <EditorContent
                  editor={editor}
                  className="w-full h-full p-2 overflow-y-auto bg-white text-black outline-none"
                />
              )}
            </div>
          </div>

          {/* File Preview */}
          {mediaPreview && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-card">
                <div className="flex items-center gap-2">
                  {mediaPreview.type === "video" && (
                    <video src={mediaPreview.previewUrl} className="h-10 w-10 object-cover rounded" />
                  )}
                  {(mediaPreview.type === "image" || mediaPreview.type === "gif") && (
                    <img
                      src={mediaPreview.previewUrl || "/placeholder.svg"}
                      className="h-10 w-10 object-cover rounded"
                      alt={mediaPreview.file?.name || "Media preview"}
                    />
                  )}
                  <span className="text-sm text-zinc-400">{mediaPreview.file?.name || "Current media"}</span>
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
              disabled={isLoading || !!mediaPreview}
              onClick={() => imageInputRef.current?.click()}
            >
              <ImageIcon />
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
              disabled={isLoading || !!mediaPreview}
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
          </div>

          {/* Submit Button */}
          <Button
            variant="default"
            className="w-full text-white"
            onClick={handleSubmit}
            disabled={isLoading || isFetching}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </div>
            ) : (
              "Update Post"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
