"use client";
import HomePage from "@/components/homePageLayout/HomePage";
import TopicSelectionModal from "@/components/SelectTopicForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleTopicSelection = (selectedTopics: string[]) => {
    setIsModalOpen(false); // Close modal after topic selection
  };

  useEffect(() => {
    if (status === "loading") {
      return; // Show loading state while the session is being fetched
    }

    if (session) {
      // If the user is new, open the modal
      if (session.user?.isNewUser) {
        setIsModalOpen(true); // Open modal for topic selection
      }
    } else {
      router.push("/"); // Redirect to sign-in page if not authenticated
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>; // Optionally, show a loading spinner
  }

  return (
    <div className=" min-h-screen pt-16">
      <HomePage />
      {/* <TopicSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTopicSelection}
      /> */}
    </div>
  );
}
