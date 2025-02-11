// components/AuthHandler.tsx
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";

const AuthHandler = () => {
  const { data: session } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (session?.user) {
      // Dispatch user data to Redux store
      dispatch(setUser(session.user));
    }
  }, [session, dispatch]);

  return null; // This component doesn't render anything
};

export default AuthHandler;
