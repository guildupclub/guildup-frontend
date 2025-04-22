// "use client";
// import HomePage from "@/components/homePageLayout/HomePage";
// import TopicSelectionModal from "@/components/SelectTopicForm";
// import { setUserFollowedCommunities } from "@/redux/userSlice";
// import axios from "axios";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";

// export default function Home() {
//   const { data: session, status } = useSession();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const router = useRouter();
//   const dispatch= useDispatch();

//   const handleTopicSelection = (selectedTopics: string[]) => {
//     setIsModalOpen(false); // Close modal after topic selection
//   };

//   useEffect(() => {
//     if (status === "loading") {
//       return; // Show loading state while the session is being fetched
//     }

//     if (session) {
//       async function fetchCommunities() {
//         try {
//           const res = await axios.post(
//             `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user/follow`,
//             {
//               userId: session?.user._id,
//             }
//           );
//           dispatch(setUserFollowedCommunities(res.data.data));
//         } catch (error) {
//           console.error(error);
//         }
//       }
//       fetchCommunities();
//       // If the user is new, open the modal
//       if (session.user?.isNewUser) {
//         setIsModalOpen(true); // Open modal for topic selection
//       }
//     } else {
//       router.push("/"); // Redirect to sign-in page if not authenticated
//     }
//   }, [session, status, router]);

//   if (status === "loading") {
//     return <div>Loading...</div>; // Optionally, show a loading spinner
//   }

//   return (
//     <div className=" min-h-screen pt-16">
//       <HomePage />
//       {/* <TopicSelectionModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSubmit={handleTopicSelection}
//       /> */}
//     </div>
//   );
// }

"use client";
import { StringConstants } from "@/components/common/CommonText";
import CategoryBar from "@/components/explore/CategoryBar";
import { API_BASE_URL } from "../config/constants";
import CommunitySection from "@/components/explore/CommunitySection";
import TrendingSection from "@/components/explore/TrendingSection";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { setUserFollowedCommunities } from "@/redux/userSlice";
import { useDispatch } from "react-redux";
import React, { useEffect, useRef, useState } from "react";
import Header from "@/components/explore/Header";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CreatorForm from "@/components/form/CreatorForm";
import { Dialog } from "@/components/ui/dialog";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";


function Page() {
  const { data: session, status } = useSession();
  const [category, setCategory] = useState<any>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const user = useSelector((state: RootState) => state.user);
  const isCreator = user?.user?.is_creator ? true : false;


  useEffect(() => {
    setIsMounted(true);
  }, []);

  
  useEffect(() => {
    if (!isMounted || status === "loading") return;

    if (!session) {
      router.push("/"); 
    } else {
      const fetchCommunities = async () => {
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
      };
      fetchCommunities();

      if (session.user?.isNewUser) {
        setIsModalOpen(true);
      }
    }
  }, [session, status, isMounted, router]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        console.log("BACKEND_URL", process.env.NEXT_PUBLIC_BACKEND_BASE_URL);
        console.log("BACKENDURL_FROM_POST", API_BASE_URL);
        console.log("NEXTAUTH_URL", process.env.NEXTAUTH_URL);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/category`
        );

        setCategory([
          { _id: "all", name: "All Category" },
          ...response.data.data,
        ]);
        setSelectedCategory("all");
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategory();
  }, []);

  if (status === "loading" || !isMounted) {
    return <div>{StringConstants.LOADING}</div>;
  }

  const handleCreatorButtonClick = () => {
    if (!session) {
      toast("Sign in required", {
        action: {
          label: "Sign In",
          onClick: () => signIn(undefined, {
            callbackUrl: `${window.location.origin}?hero=1`
          }),
        },
      });
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleScroll = () => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-background pb-16">
      <CategoryBar categorys={category} selectCategory={setSelectedCategory} />
      {(!isCreator) && (
        <div className="md:hidden mt-4 flex flex-col items-center justify-center text-center mb-4">
          <h2 className="text-2xl font-semibold">Join or create a community to start interacting with other members.</h2>
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleScroll}
              className="px-2 py-1 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100"
              >
              Explore Communities
            </button>
            <Dialog
              open={session ? isDialogOpen : false}
              onOpenChange={setIsDialogOpen}
              >
              <button
                className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleCreatorButtonClick}
                >
                {StringConstants.CREATE_A_PAGE}
              </button>

              {session && <CreatorForm onClose={() => setIsDialogOpen(false)} /> }
            </Dialog>
          </div>
        </div>
      )}
      <Header />
      <div className="w-full lg:px-[100px] ">
        <div className="p-6 sm:px-0">
          <div className="flex gap-6 md:justify-between">
            <div className="w-full" ref={targetRef}>
              <h1 className="text-xl lg:text-2xl font-bold mb-4">
                {StringConstants.TOP_PAGES}
              </h1>
              <CommunitySection activeCategory={selectedCategory} />
            </div>

            <div className="col-span-1 hidden md:block">
              <TrendingSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
