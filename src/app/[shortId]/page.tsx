"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";

export default function RedirectPage({
  params,
}: {
  params: { shortId: string };
}) {
  const router = useRouter();

  useEffect(() => {
    const redirectToFullUrl = async () => {
      try {
        console.log("Making request to URL: ", `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/${params.shortId}`);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/${params.shortId}`
        );
        const fullUrl = res.data.fullUrl;

        if (fullUrl) {
          window.location.href = fullUrl; 
        } else {
          router.replace("/404"); 
        }
      } catch (err) {
        console.log("Short URL redirect error:", err);
        router.replace("/404");
      }
    };

    redirectToFullUrl();
  }, [params.shortId, router]);

  return (
    <div className="p-4">
      <div>{JSON.stringify(params)}</div>
      <p>Redirecting...</p>
    </div>
  );
}
