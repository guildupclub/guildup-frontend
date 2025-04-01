// "use client";
// import { StringConstants } from "@/components/common/CommonText";
// import CategoryBar from "@/components/explore/CategoryBar";
// import { API_BASE_URL } from "../../config/constants";
// import CommunitySection from "@/components/explore/CommunitySection";
// import TrendingSection from "@/components/explore/TrendingSection";
// import axios from "axios";
// import { useSession, signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";

// import React, { useEffect, useState } from "react";
// import Header from "@/components/explore/Header";

// function Page() {
//   const [category, setCategory] = useState<any>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string>("");
//   const { data: session, status } = useSession();
//   const [isMounted, setIsMounted] = useState(false);
//   const router = useRouter();

//   // Set isMounted to true after the component is mounted on the client
//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   //Redirect to Google auth if not authenticated, but only on the client side
//   // useEffect(() => {
//   //   if (isMounted && status !== "loading" && !session) {
//   //     signIn("google"); // Redirect to Google authentication
//   //   }
//   // }, [session, status, isMounted]);

//   useEffect(() => {
//     const fetchCategory = async () => {
//       console.log("BACKEND_URL", `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}`);
//       console.log("BACKENDURL_FROM_POST", API_BASE_URL);
//       console.log("NEXTAUTH_URL", `${process.env.NEXTAUTH_URL}`);
//       const response = await axios.get(
//         `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/category`
//       );
//       // setCategory(response.data.data);
//       // setSelectedCategory(response.data.data[0]?._id || "");

//       setCategory([
//         { _id: "all", name: "All Category" },
//         ...response.data.data,
//       ]);
//       setSelectedCategory("all");
//     };
//     fetchCategory();
//   }, []);

//   // Render nothing while loading or redirecting
//   if (status === "loading" || !isMounted) {
//     return <div>{StringConstants.LOADING}</div>; // You can add a loading spinner here
//   }

//   return (
//     <div className="bg-background pb-16">
//       <CategoryBar categorys={category} selectCategory={setSelectedCategory} />
//       <Header />
//       <div className="w-full lg:px-[100px] ">
//         <div className="p-6 sm:px-0">
//           <div className="flex gap-6 md:justify-between">
//             <div className="w-full">
//               <h1 className="text-xl lg:text-2xl font-bold mb-4">
//                 {StringConstants.TOP_PAGES}
//               </h1>
//               <CommunitySection activeCategory={selectedCategory} />
//             </div>

//             <div className="col-span-1  hidden md:block">
//               {/* <h1 className="text-2xl font-bold mb-4">Trending Tags</h1> */}
//               <TrendingSection />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Page;

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
  const dispatch = useDispatch();

  const handleTopicSelection = (selectedTopics: string[]) => {
    setIsModalOpen(false); // Close modal after topic selection
  };

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
