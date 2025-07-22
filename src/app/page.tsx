"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import Hero from "@/components/heroSection/HeroSection";
import { Dialog } from "@/components/ui/dialog";
import CreatorForm from "@/components/form/CreatorForm";
import { useTracking } from "@/hooks/useTracking";
import { PageTracker } from "@/components/analytics/PageTracker";
import Footer from "@/components/layout/Footer";
import Loader from "@/components/Loader";

function Page() {
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [isCreatorFormOpen, setIsCreatorFormOpen] = useState(false);
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const tracking = useTracking();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || status === "loading") return;

    if (!session) {
      tracking.trackCustomEvent("home_page_viewed_anonymous", {});
    } else {
      tracking.trackCustomEvent("home_page_viewed_authenticated", {
        user_id: session.user._id,
        is_creator: session.user?.is_creator,
        is_new_user: session.user?.isNewUser,
      });
    }
  }, [session, status, isMounted, tracking]);

  if (!isMounted || status === "loading") {
    return (
      <div className="min-h-[100vh] flex items-center justify-center">
        <Loader />
      </div>
    );
      }

  return (
    <Suspense
      fallback={
        <div className="min-h-[100vh] flex items-center justify-center">
          <Loader />
        </div>
      }
    >
        <div className="min-h-screen bg-white relative">
          {/* Creator Form Dialog */}
          <Dialog open={isCreatorFormOpen} onOpenChange={setIsCreatorFormOpen}>
            <CreatorForm onClose={() => setIsCreatorFormOpen(false)} />
          </Dialog>

        {/* Hero Section */}
          <div className="relative z-10">
              <Hero />
        </div>

        {/* White spacing before footer */}
        <div className="bg-white py-8"></div>

        {/* Footer */}
        <Footer />
      </div>

      <PageTracker
        pageName="Home"
        pageCategory="landing"
        metadata={{
          user_signed_in: !!session,
          user_id: session?.user._id,
          is_creator: session?.user?.is_creator,
          is_new_user: session?.user?.isNewUser,
        }}
        trackScrollDepth={true}
        trackTimeOnPage={true}
        trackClicks={true}
      />
    </Suspense>
  );
}

export default Page;
