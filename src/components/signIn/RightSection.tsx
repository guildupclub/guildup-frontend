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
    <div className="w-full h-screen flex items-center justify-center bg-white p-5">
      {session && isFormOpen ? (
        <CreatorForm onSuccess={handleSuccess} /> 
      ) : (
        <LoginContainer /> 
      )}
    </div>
  );
};
