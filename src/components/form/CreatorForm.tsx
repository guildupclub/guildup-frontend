"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import { Plus } from "lucide-react";
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
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { categories } from "./Categories";


interface CreatorFormProps {
  onClose: () => void;
}

export default function CreatorForm({ onClose }: CreatorFormProps) {
  const queryClient = useQueryClient();
  const userId = useSelector((state: RootState) => state.user.user?._id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: "",
  });
  const [categoryId, setCategoryId] = useState("");
  const [additionalTags] = useState(["first_community", "abhishek"]);

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
  };

  // Mutation for creating community
  const createCommunity = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      if (data.r !== "s")
        console.log(data.e || "Failed to create community");
      
      return data;
    },
    onSuccess: () => {
      toast.success("Community created successfully! 🎉");
      queryClient.invalidateQueries({ queryKey: ["communities"] }); // Refresh data
      setFormData({ name: "", description: "", tags: "" });
      setCategoryId("");
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Failed to create community: ${error.message}`);
      onClose();
    },
  });

  // Handle submit action
  const handleSubmit = () => {
    if (!formData.name || !formData.description || !categoryId) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createCommunity.mutate();
  };

  return (
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
            <SelectContent className="bg-background text-accent border-none h-64 cursor-pointer">
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
            className="bg-background border-none"
          />
        </div>
        <div className="space-y-2">
          <Label>Community Description</Label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Type anything"
            className="bg-background border-none min-h-[30px]"
          />
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="text-muted bg-transparent border-gray-600 hover:bg-background"
        >
          Cancel
        </Button>

        <Button className="text-white" onClick={handleSubmit}>
          Create
        </Button>
      </div>
    </DialogContent>
  );
}