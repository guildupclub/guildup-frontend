"use client";
import HomePage from "@/components/homePageLayout/HomePage";
import Loader from "@/components/Loader";
import TopicSelectionModal from "@/components/SelectTopicForm";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function Home() {
  const { isLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTopicSelection = (selectedTopics: string[]) => {
    setIsModalOpen(false); // Close modal after topic selection
  };

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-r from-[#777BEA]/20 text-muted">
      <HomePage />
    </div>
  );
}
