"use client";

import * as React from "react";
import { Link2, Smile, Plus, X, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from "next-auth/react";
interface UploadedFile {
  id: string;
  type: "image" | "video" | "pdf";
  url: string;
  name: string;
}

export function PostDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const pdfInputRef = React.useRef<HTMLInputElement>(null);

  const { data: session } = useSession();
  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video" | "pdf"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setUploadedFiles((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          type,
          url: fileUrl,
          name: file.name,
        },
      ]);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setContent((prev) => prev + emoji.native);
  };

  const handleLinkAdd = () => {
    const url = prompt("Enter URL:");
    if (url) {
      setContent((prev) => `${prev} ${url} `);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#1a1a1a] border-zinc-800 p-0">
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-zinc-200">
                  {session?.user?.name || "User Name"}
                  <span className="text-zinc-500"> posting in</span>
                  <span className="font-medium "> Technology</span>
                </span>
                {/* <div className="flex items-center text-sm text-zinc-400">
                  <span>posting in</span>
                  <span className="font-medium text-zinc-200">Technology</span>
                </div> */}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-300 hover:text-zinc-600"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <Select defaultValue="technology">
            <SelectTrigger className="w-[180px] bg-transparent border-zinc-800 text-zinc-200 mx-10">
              <SelectValue placeholder="Select Channel" />
            </SelectTrigger>
            <SelectContent className="bg-black text-zinc-200 border-zinc-800">
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Heading"
            className="bg-transparent border-0 p-0 text-lg text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-0"
          />

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something..."
            className="min-h-[200px] bg-transparent border-0 p-0 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-0 resize-none"
          />

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#2a2a2a]"
                >
                  {file.type === "image" && (
                    <img
                      src={file.url || "/placeholder.svg"}
                      alt={file.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  )}
                  {file.type === "video" && (
                    <video
                      src={file.url}
                      className="h-10 w-10 object-cover rounded"
                    />
                  )}
                  {file.type === "pdf" && (
                    <div className="h-10 w-10 flex items-center justify-center bg-red-500/20 rounded">
                      PDF
                    </div>
                  )}
                  <span className="text-sm text-zinc-400">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-8 w-8"
                    onClick={() =>
                      setUploadedFiles((prev) =>
                        prev.filter((f) => f.id !== file.id)
                      )
                    }
                  ></Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "image")}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-lg bg-[#2a2a2a] hover:bg-[#333333]"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#3b82f6]"
                >
                  <path
                    d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="8"
                    cy="8"
                    r="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </Button>

              <input
                type="file"
                ref={videoInputRef}
                className="hidden"
                accept="video/*"
                onChange={(e) => handleFileUpload(e, "video")}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-lg bg-[#2a2a2a] hover:bg-[#333333]"
                onClick={() => videoInputRef.current?.click()}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#ef4444]"
                >
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle cx="16" cy="8" r="1" fill="currentColor" />
                </svg>
              </Button>

              <input
                type="file"
                ref={pdfInputRef}
                className="hidden"
                accept=".pdf"
                onChange={(e) => handleFileUpload(e, "pdf")}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-lg bg-[#2a2a2a] hover:bg-[#333333]"
                onClick={() => pdfInputRef.current?.click()}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#eab308]"
                >
                  <path
                    d="M12 8V12L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-lg bg-[#2a2a2a] hover:bg-[#333333]"
                  >
                    <Smile className="h-5 w-5 text-[#22c55e]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0 border-zinc-800"
                  side="top"
                >
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme="dark"
                  />
                </PopoverContent>
              </Popover>

              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-lg bg-[#2a2a2a] hover:bg-[#333333]"
                onClick={handleLinkAdd}
              >
                <Link2 className="h-5 w-5 text-[#7c3aed]" />
              </Button>
            </div>
            <Button className=" px-8">Post</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
