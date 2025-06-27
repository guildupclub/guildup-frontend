import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setUser, setSessionId } from "../redux/userSlice";

const AuthHandler = () => {
  const { data: session } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSessionId = async (userId: string) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/getSession`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          }
        );
        if (!response.ok) {
          console.error("Failed to fetch sessionId:", response.statusText);
          return;
        }

        const data = await response.json();
        console.log("API Response:", data);
        if (data.data) {
          const sessionId = data.data;
          console.log("Session ID:", sessionId);
          dispatch(setSessionId(sessionId));
        } else {
          console.error("Session ID not found in the response:", data);
        }
      } catch (error) {
        console.error("Error fetching session ID:", error);
      }
    };

    const fetchUserProfile = async (userId: string) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/profile?userId=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error("Failed to fetch user profile:", response.statusText);
          return;
        }

        const data = await response.json();
        console.log("User Profile Response:", data);
        
        if (data.r === "s" && data.data) {
          // Merge the profile data with the existing session user data
          const profileData = data.data;
          
          dispatch(setUser({
            ...session?.user,
            ...profileData,
            _id: session?.user._id || profileData._id,
          }));
        } else {
          console.error("User profile data not found in the response:", data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    console.log("@session", session);
    if (session?.user) {
      dispatch(setUser(session.user));

      const userId = session.user._id;
      console.log("User ID:", userId);
      
      if (userId) {
        fetchSessionId(userId);
        fetchUserProfile(userId);
      }
    }
  }, [session, dispatch]);

  return null; // This component doesn't render anything
};

export default AuthHandler;
