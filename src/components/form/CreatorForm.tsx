"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";

import { categories } from "./Categories";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function CreatorForm() {
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const sessionId = useSelector((state: RootState) => state.user.sessionId);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: "",
    topic: "",
  });
  const [categoryId, setCategoryId] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [additionalTags] = useState(["first_community", "abhishek"]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            name: formData.name,
            description: formData.description,
            additional_tags: additionalTags,
            categoryId: categoryId,
            is_locked: false,
          }),
        }
      );

      const data = await response.json();
      if (data.r === "s") {
        toast.success("Community created successfully! 🎉");
        setIsDialogOpen(false);
      } else if (data.r === "e") {
        throw new Error(data.e || "Failed to create community");
      } else {
        throw new Error("Unexpected response from the server");
      }
    } catch (error: any) {
      toast.error(`Failed to create community: ${error.message}`);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-lg bg-card hover:bg-background text-accent"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card text-muted border-none">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-xl font-normal">
            Fill to become a creator
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Community Name</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter name"
              className="bg-background border-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Select Topic</Label>
            <Select onValueChange={handleCategoryChange}>
              <SelectTrigger className="bg-background border-none">
                <SelectValue placeholder="Select your topic" />
              </SelectTrigger>
              <SelectContent className="bg-background  text-accent border-none h-64 cursor-pointer">
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Enter Tags"
              className="bg-background  border-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Community Description</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Type anything"
              className="bg-background  border-none min-h-[30px]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-2">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            className="text-muted bg-transparent border-gray-600 hover:bg-background  "
          >
            Cancel
          </Button>
          <Button className="text-white" onClick={handleSubmit}>
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
