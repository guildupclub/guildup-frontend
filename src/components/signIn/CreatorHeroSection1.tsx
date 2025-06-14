import Image from "next/image";
import guildup_logo from "./../../../public/svg/GuildUp_Logo_Light.svg";
import Login_laptop from "./../../../public/Login_laptop.png";

export const CreatorHeroSection1: React.FC = () => {
  return (
    <div className="w-full bg-white flex flex-col items-center justify-start p-8 gap-16 border border-background min-h-screen">
      <div className="flex justify-center w-full">
        <Image
          src={guildup_logo || "/placeholder.svg"}
          alt="GuildUp"
          className="h-16 w-auto md:block"
        />
      </div>

      <div className="flex flex-col items-center gap-8 w-full max-w-3xl">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-4xl font-bold">
            Grow your impact. GuildUp is <br className="hidden md:block" /> your
            gateway.
          </h1>
          <p className="text-xl font-normal my-2">
            Join 70+ coaches, therapists, and professionals building their
            digital presence on GuildUp. Create your space. Offer sessions. Earn
            — all in under 30 minutes.{" "}
            <span className="font-semibold text-[#334BFF] ">
              ✨ Build your expert page and start offering services today →
            </span>
          </p>
        </div>

        <div className="flex justify-center w-full">
          <Image
            src={Login_laptop || "/placeholder.svg"}
            alt="GuildUp"
            className="h-[360px] w-auto md:block"
            priority
          />
        </div>
      </div>
    </div>
  );
};
