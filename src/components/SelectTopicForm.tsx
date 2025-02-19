"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store"; // Adjust the import as per your store location
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const categories = [
  { _id: "6702403bf7b07c3742024dd0", name: "Art and Design", icon: "🎨" },
  { _id: "6702403bf7b07c3742024dcf", name: "Business Builders", icon: "👔" },
  { _id: "67a74cc7462d78176d24478c", name: "Business Coaching", icon: "📊" },
  { _id: "67a74c7c462d78176d244783", name: "Cryptocurrency", icon: "🪙" },
  { _id: "67a74c93462d78176d244786", name: "Digital Marketing", icon: "🎯" },
  { _id: "6702403bf7b07c3742024dc8", name: "EduLearn Hub", icon: "📖" },
  { _id: "67a74cd9462d78176d24478f", name: "Financial Literacy", icon: "📈" },
  { _id: "6702403bf7b07c3742024dce", name: "Foodies Unite", icon: "🍳" },
  { _id: "6702403bf7b07c3742024dc9", name: "Fashion Forward", icon: "👗" },
  { _id: "6702403bf7b07c3742024dd6", name: "Film Buffs", icon: "🎬" },
  { _id: "6702403bf7b07c3742024dcb", name: "Fitness Goals", icon: "💪" },
  { _id: "6702403bf7b07c3742024dcc", name: "Gaming Universe", icon: "🎮" },
  { _id: "67a74d74462d78176d2447a5", name: "Gaming", icon: "🎮" },
  { _id: "6702403bf7b07c3742024dcd", name: "Green Planet", icon: "🌱" },
  { _id: "67a74c4f462d78176d24477d", name: "Graphic Design", icon: "🎨" },
  { _id: "67a74d05462d78176d244795", name: "Leadership", icon: "🏆" },
  { _id: "67a74d62462d78176d2447a2", name: "Life Coaching", icon: "🧠" },
  {
    _id: "6702403bf7b07c3742024dd3",
    name: "Mental Health Matters",
    icon: "🧠",
  },
  { _id: "67a74d38462d78176d24479b", name: "Music", icon: "🎵" },
  { _id: "6702403bf7b07c3742024dd2", name: "Music Vibes", icon: "🎶" },
  { _id: "67a74cee462d78176d244792", name: "Nutrition", icon: "🥗" },
  { _id: "6702403bf7b07c3742024dca", name: "Political Pulse", icon: "🗳️" },
  { _id: "67a74d23462d78176d244798", name: "Parenting", icon: "👨‍👩‍👧‍👦" },
  { _id: "67a74d49462d78176d24479e", name: "Photography", icon: "📸" },
  { _id: "6702403bf7b07c3742024dd5", name: "Science Seekers", icon: "🔬" },
  { _id: "6702403bf7b07c3742024dc7", name: "Tech Innovators", icon: "💻" },
  { _id: "67a74bb9462d78176d24477a", name: "Technology", icon: "💻" },
  { _id: "6702403bf7b07c3742024dd1", name: "Travel Wanderers", icon: "🌍" },
  { _id: "67a74cb6462d78176d244789", name: "Travel", icon: "✈️" },
  { _id: "67a74c60462d78176d244780", name: "Writing", icon: "📝" },
];

interface TopicSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedTopics: string[]) => void;
}

export default function TopicSelectionModal({
  isOpen,
  onClose,
  onSubmit,
}: TopicSelectionModalProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const userId = useSelector((state: RootState) => state.user.user?._id); // Get userId from Redux

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSubmit = async () => {
    if (!userId) {
      console.error("User ID is missing");
      return;
    }

    const payload = {
      userId,
      categories: selectedTopics,
    };

    try {
      const response = await fetch("http://localhost:8000/v1/category/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update categories");
      }

      onSubmit(selectedTopics);
      onClose();
    } catch (error) {
      console.error("Error updating categories:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl text-zinc-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Explore your favourite topics
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] px-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-900 overflow-auto scrollbar-none cursor-pointer">
          <div className="grid grid-cols-2 gap-4 py-2 md:grid-cols-3">
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => toggleTopic(category._id)}
                className={`flex items-center gap-3 rounded-lg border border-gray-700 px-4 py-2 transition-all hover:bg-gray-900 ${
                  selectedTopics.includes(category._id)
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            className="bg-primary-gradient px-8"
            disabled={selectedTopics.length === 0}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
