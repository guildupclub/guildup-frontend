import Image from "next/image";
import guildup_logo from "./../../../public/svg/GuildUp_Logo_Light.svg";
import Login_laptop from "./../../../public/Login_laptop.png";

export const CreatorHeroSection1: React.FC = () => {
  return (
    <div className="w-full bg-white flex flex-col items-center justify-start p-8 gap-16 border border-background">
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
            Be found. GuildUp makes it easy.
          </h1>
          <p className="text-xl font-normal">
            Sign up on GuildUp and grow your Guild with thousands of users
            looking for top coaches, consultants, and professionals.{" "}
            <span className="font-semibold text-[#334BFF]">
              Build your custom community and start earning in under 30 minutes!
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
