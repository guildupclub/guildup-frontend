import Image from "next/image";
import guildup_logo from './../../../public/svg/GuildUp_Logo_Light.svg';
import { FaCheck } from "react-icons/fa";
import Login_mobile from "./../../../public/Login_mobile.png";

export const CreatorHeroSection2: React.FC = () => {
  return (
    <div className="md:w-1/2 bg-white flex flex-col items-center p-8 gap-8 border border-background overflow-hidden">
      <div className="max-w-2xl w-full flex flex-col items-center gap-8">
        <Image
          src={guildup_logo || "/placeholder.svg"}
          alt="GuildUp"
          className="h-16 w-auto"
        />

        <div className="flex flex-col items-center gap-8 w-full">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-semibold">
              Start Monetizing Your Expertise
            </h1>
            <p className="text-2xl font-normal">
              Create your Guild where you can{" "}
              <span className="font-semibold text-[#334BFF]">offer</span> paid
              consultations,{" "}
              <span className="font-semibold text-[#334BFF]">build</span> your
              following, get{" "}
              <span className="font-semibold text-[#334BFF]">discovered</span>.
            </p>
          </div>

          <div className="space-y-4 w-full max-w-xl">
            {[
              "No more waiting for clients to find your Instagram bio link.",
              "No more DMs going unanswered or ghosted inquiries.",
              "Clients discover, compare, and book you instantly—zero friction.",
              "Structured bookings & secure payments—so you focus on what you do best.",
            ].map((text, index) => (
              <div key={index} className="flex items-start gap-3">
                <FaCheck className="mt-2 text-[#334BFF]" />
                <p className="text-xl font-normal">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Image
              src={Login_mobile || "/placeholder.svg"}
              alt="GuildUp"
              className="h-[360px] w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};