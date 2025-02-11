"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CreatorForm() {
  return (
    <Dialog defaultOpen>
      <DialogContent className="sm:max-w-[425px] bg-[#1C1C1C] text-white border-none">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-normal">
            Fill to become a creator
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Community Name</Label>
            <Input
              placeholder="Enter name"
              className="bg-[#2C2C2C] border-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Select Topic</Label>
            <Select>
              <SelectTrigger className="bg-[#2C2C2C] border-none">
                <SelectValue placeholder="Select your topics" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 text-zinc-300 border-none">
                <SelectItem value="tech">Technology</SelectItem>
                <SelectItem value="art">Art</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input
              placeholder="Enter Tags"
              className="bg-[#2C2C2C] border-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Community Description</Label>
            <Textarea
              placeholder="Type anything"
              className="bg-[#2C2C2C] border-none min-h-[30px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Creator's Social</Label>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>Instagram</span>
                </div>
                <Button
                  variant="ghost"
                  className="text-white hover:text-purple-500 hover:bg-transparent p-0"
                >
                  Connect
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 9H2V21H6V9Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>LinkedIn</span>
                </div>
                <Button
                  variant="ghost"
                  className="text-white hover:text-purple-500 hover:bg-transparent p-0"
                >
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-2">
          <Button
            variant="outline"
            className="text-white bg-transparent border-gray-600 hover:bg-gray-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button className=" ">Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
