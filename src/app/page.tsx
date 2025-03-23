"use client";
import HomePage from "@/components/homePageLayout/HomePage";
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
  const dispatch= useDispatch();

  const handleTopicSelection = (selectedTopics: string[]) => {
    setIsModalOpen(false); // Close modal after topic selection
  };

  useEffect(() => {
    if (status === "loading") {
      return; // Show loading state while the session is being fetched
    }

    if (session) {
      async function fetchCommunities() {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user/follow`,
            {
              userId: session?.user._id,
            }
          );
          dispatch(setUserFollowedCommunities(res.data.data));
        } catch (error) {
          console.error(error);
        }
      }
      fetchCommunities();
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
