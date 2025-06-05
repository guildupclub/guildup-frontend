"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const PaymentsRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new dashboard payments page
    router.replace("/dashboard/payments");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

function Payments() {
  return <PaymentsRedirect />;
}

export default Payments