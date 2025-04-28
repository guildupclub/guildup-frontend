"use client";
import HomePage from "@/components/homePageLayout/HomePage";
import Loader from "@/components/Loader";
import TopicSelectionModal from "@/components/SelectTopicForm";
import { setUserFollowedCommunities } from "@/redux/userSlice";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function Home() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleTopicSelection = (selectedTopics: string[]) => {
    setIsModalOpen(false); // Close modal after topic selection
  };

  if (status === "loading") {
    return <div><Loader/></div>;
  }

  return (
    <div className=" min-h-screen pt-16">
      <HomePage />
    </div>
  );
}
