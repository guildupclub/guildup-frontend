import React from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface GoogleSignInProps {
  isLoading?: boolean;
  callbackUrl?: string;
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({ isLoading, callbackUrl = '/' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 rounded-lg shadow-lg bg-card">
        <Link 
          href="/"
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
        </Link>

        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-accent">Welcome</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <Button
          variant="outline"
          className="w-full bg-slate-200 "
          onClick={() => signIn("google", { callbackUrl })}
          disabled={isLoading}
        >
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          Continue with Google
        </Button>
      </div>
    </div>
  );
};

export default GoogleSignIn;