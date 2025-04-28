import Image from "next/image";
import guildup_logo from "./../../../public/svg/GuildUp_Logo_Light.svg";
import { FaCheck } from "react-icons/fa";
import Login_mobile from "./../../../public/Login_mobile.png";

export const CreatorHeroSection2: React.FC = () => {
  return (
    <div className="w-full bg-white flex flex-col items-center px-6 py-8 border border-background overflow-hidden">
      <div className="max-w-3xl w-full flex flex-col items-center space-y-10">
        {/* Logo */}
        <Image src={guildup_logo} alt="GuildUp" className="h-12 w-auto" />

        {/* Heading & Subheading */}
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold leading-tight">
            Start Monetizing Your Expertise
          </h1>
          <p className="text-xl font-medium text-gray-700 leading-relaxed">
            Create your Guild where you can{" "}
            <span className="font-semibold text-[#334BFF]">offer</span> paid
            consultations,{" "}
            <span className="font-semibold text-[#334BFF]">build</span> <br />{" "}
            your following, and get{" "}
            <span className="font-semibold text-[#334BFF]">discovered</span>.
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-2 w-full max-w-2xl">
          {[
            "No more waiting for clients to find your Instagram bio link.",
            "No more DMs going unanswered or ghosted inquiries.",
            "Clients discover, compare, and book you instantly—zero friction.",
            "Structured bookings & secure payments—so you focus on what you do best.",
          ].map((text, index) => (
            <div key={index} className="flex items-start gap-4">
              <FaCheck className="text-[#334BFF] mt-1.5 text-lg" />
              <p className="text-lg font-medium text-gray-800">{text}</p>
            </div>
          ))}
        </div>

        {/* Image */}
        <div className="mt-6 flex justify-center">
          <Image
            src={Login_mobile}
            alt="GuildUp"
            className="h-[280px] w-auto drop-shadow-md"
          />
        </div>
      </div>
    </div>
  );
};
