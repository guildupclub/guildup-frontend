"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { setUser } from "@/redux/userSlice";
import { useDispatch } from "react-redux";
import GoogleSignIn from "@/components/common/GoogleSignIn";

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // const result = await signIn("credentials", {
      //   email,
      //   password,
      //   redirect: false,
      // });
      const result = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/login`,
        {
          email,
          password,
        }
      );

      dispatch(
        setUser({
          _id: result.data.data.user.id,
          name: result.data.data.user.name || "",
          email: result.data.data.user.email,
          image: result.data.data.user.avatar,
          accessToken: result.data.data.session,
        })
      );
      console.log("@sininreust", result);
      if (result?.data?.e === "e") {
        setError(result.data.data);
      } else {
        toast.success("Signed in successfully!");
        router.push("/explore");
        router.refresh();
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleSignIn/>
  );
}
