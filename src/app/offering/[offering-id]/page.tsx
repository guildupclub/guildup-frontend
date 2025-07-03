// creating a dummy page to handle dynamic routes for offering-id
"use client";
import React from "react";
import { useParams } from "next/navigation";
import OfferingPage from "@/components/offerings/offeringPage";

export default function Page() {
  let { "offering-id": offeringId } = useParams();
  offeringId = String(offeringId);
  return (
    <div className="min-h-screen bg-background pt-10 pb-4 px-4 sm:px-6 lg:px-8">
      <OfferingPage offeringId={offeringId} />
    </div>
  );
}
