"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import CreatorForm from "./CreatorForm";
import { LoginContainer } from "./LoginContainer";

export const RightSection: React.FC = () => {
  const { data: session } = useSession();
  const [isFormOpen, setIsFormOpen] = useState(true);

  const handleSuccess = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-[#9900FA] to-[#334BFF]  lg:p-8">
      {session && isFormOpen ? (
        <CreatorForm onSuccess={handleSuccess} /> // when logged in show creator form
      ) : (
        <LoginContainer /> // when logged out show login form
      )}
    </div>
  );
};
