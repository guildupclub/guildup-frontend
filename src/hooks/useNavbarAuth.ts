import { signIn, signOut, useSession } from "next-auth/react";
import { toast } from "sonner";

export const useNavbarAuth = () => {
  const { data: session } = useSession();

  const handleSignOut = () => {
    localStorage.clear();
    signOut();
  };

  const handleSignIn = (callbackUrl?: string) => {
    signIn(undefined, {
      callbackUrl: callbackUrl || `${window.location.href}`,
    });
  };

  const handleCreatorButtonClick = (setIsCreatorFormOpen: (open: boolean) => void) => {
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
      setIsCreatorFormOpen(true);
    }
  };

  return {
    session,
    handleSignOut,
    handleSignIn,
    handleCreatorButtonClick,
  };
}; 