import Image from "next/image";
import guildup_logo from './../../../public/svg/GuildUp_Logo_Light.svg';
import { FaCheck } from "react-icons/fa";
import Login_mobile from "./../../../public/Login_mobile.png";

export const CreatorHeroSection2: React.FC = () => {
    return (
      <div className="w-1/2 bg-white flex flex-col items-start justify-start p-8 gap-4 border border-background overflow-hidden">
        <div className="flex justify-center w-full">
          <Image
            src={guildup_logo || "/placeholder.svg"}
            alt="GuildUp"
            className="h-16 w-auto md:block"
          />
        </div>
        {/* <div className="h-14 w-full bg-red-500"></div> */}
        <div className="flex flex-col">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold">Start Monetizing Your Expertise</h1>
              <p className="text-2xl font-normal">
                Create your Guild where you can <span className="font-semibold text-[#334BFF]">offer</span> paid consultations, <span className="font-semibold text-[#334BFF]">build</span> your following, get <span className="font-semibold text-[#334BFF]">discovered</span>.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-3 items-center">
                <FaCheck />
                <p className="font-normal text-2xl">No more waiting for clients to find your Instagram bio link.</p>
              </div>
              <div className="flex gap-3 items-center">
                <FaCheck />
                <p className="font-normal text-2xl">No more DMs going unanswered or ghosted inquiries.</p>
              </div>
              <div className="flex gap-3 items-center">
                <FaCheck />
                <p className="font-normal text-2xl">Clients discover, compare, and book you instantly—zero friction.</p>
              </div>
              <div className="flex gap-3 items-center">
                <FaCheck />
                <p className="font-normal text-2xl">Structured bookings & secure payments—so you focus on what you do best.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center -mt-8">
              <Image
                src={Login_mobile || "/placeholder.svg"}
                alt="GuildUp"
                className="h-[360px] w-auto md:block -mt-4"
                />
          </div>
        </div>
      </div>
    );
  };