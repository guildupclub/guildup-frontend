"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import LoadingOverlay from "./LoadingOverlay";

interface OptimizedLayoutProps {
  children: React.ReactNode;
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="h-16 bg-gray-200 mb-4" />
      <div className="container mx-auto px-4">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function OptimizedLayout({ children }: OptimizedLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Listen for route changes
    const originalPush = router.push;
    const originalReplace = router.replace;

    router.push = (...args) => {
      handleStart();
      const result = originalPush.apply(router, args);
      
      // Reset loading after navigation
      setTimeout(handleComplete, 100);
      return result;
    };

    router.replace = (...args) => {
      handleStart();
      const result = originalReplace.apply(router, args);
      
      // Reset loading after navigation
      setTimeout(handleComplete, 100);
      return result;
    };

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [router]);

  return (
    <div className="min-h-screen">
      <LoadingOverlay isVisible={isLoading} />
      <Suspense fallback={<PageSkeleton />}>
        {children}
      </Suspense>
    </div>
  );
} 