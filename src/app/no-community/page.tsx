"use client";

import { useSession, signIn } from "next-auth/react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaUsers } from "react-icons/fa";
import { toast } from "sonner";
import { Dialog } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { StringConstants } from "@/components/common/CommonText";
import CreatorForm from "@/components/form/CreatorForm";

const NoCommunitySelected = () => {
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCreateCommunity = () => {
    if (!session) {
      signIn();
      return;
    }
  };
  const handleCreatorButtonClick = () => {
    if (!session) {
      toast("Sign in required", {
        action: {
          label: "Sign In",
          onClick: () =>
            signIn(undefined, {
              callbackUrl: `${window.location.origin}?hero=1`,
            }),
        },
      });
    } else {
      setIsDialogOpen(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <FaUsers className="text-6xl text-gray-500 mb-4" />
      <h2 className="text-2xl font-semibold">No Community Selected</h2>
      <p className="text-gray-600 mt-2">
        Join or create a community to start interacting with other members.
      </p>
      {/* <h2 className=" font-sans">Ready to Turn Your Expertise into income?</h2> */}
      <div className="mt-4 flex gap-4">
        <Button variant="outline">
          <Link
            href="/"
            // className="px-4 py-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Explore Communities
          </Link>
        </Button>
        <Dialog
          open={session ? isDialogOpen : false}
          onOpenChange={setIsDialogOpen}
        >
          <Button className="" onClick={handleCreatorButtonClick}>
            <span className="text-amber-300 hidden sm:inline">👋</span>{" "}
            {StringConstants.CREATE_A_PAGE}
          </Button>

          {session && <CreatorForm onClose={() => setIsDialogOpen(false)} />}
        </Dialog>
      </div>
    </div>
  );
};

export default NoCommunitySelected;
