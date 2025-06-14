'use client';
import { Suspense, ReactNode } from 'react';
import { PostHogProvider } from '@/contexts/PostHogProvider';

function PostHogProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div />}>
      <PostHogProvider>
        {children}
      </PostHogProvider>
    </Suspense>
  );
}

export default PostHogProviderWrapper; 