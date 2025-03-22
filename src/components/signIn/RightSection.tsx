import { useSession } from "next-auth/react";
import CreatorForm from "./CreatorForm";
import { LoginContainer } from "./LoginContainer";

export const RightSection: React.FC = () => {
  const { data: session } = useSession();
    return (
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-[#9900FA] to-[#334BFF] p-8">
          {session? <CreatorForm /> : <LoginContainer />}
      </div>
    );
  };