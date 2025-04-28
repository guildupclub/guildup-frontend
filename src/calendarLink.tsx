import { useEffect } from "react";
import { useRouter } from "next/router";

const CalendarLink = () => {
  const router = useRouter();
  const { authUrl } = router.query;

  useEffect(() => {
    if (authUrl) {
      window.location.href = authUrl as string;
    }
  }, [authUrl]);

  return <div>Redirecting to Calendar Authorization...</div>;
};

export default CalendarLink;
