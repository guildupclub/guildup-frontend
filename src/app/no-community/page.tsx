"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaUsers } from "react-icons/fa";

const NoCommunitySelected = () => {
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCreateCommunity = () => {
    if (!session) {
      signIn("google");
    } 
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <FaUsers className="text-6xl text-gray-500 mb-4" />
      <h2 className="text-2xl font-semibold">No Community Selected</h2>
      <p className="text-gray-600 mt-2">
        Join or create a community to start interacting with other members.
      </p>
      <div className="mt-4 flex gap-4">
        <Link
          href="/explore"
          className="px-4 py-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100"
        >
          Explore Communities
        </Link>
        <button
          onClick={handleCreateCommunity}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Community
        </button>
      </div>
    </div>
  );
};

export default NoCommunitySelected;
