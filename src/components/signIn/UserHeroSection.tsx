
// const UserHeroSection: React.FC = () => {
  //   return (
  //     <div className="w-1/2 bg-white flex flex-col items-start justify-start p-8 gap-16 border border-background">
  //       <div className="flex justify-center w-full">
  //         <Image
  //           src={guildup_logo || "/placeholder.svg"}
  //           alt="GuildUp"
  //           className="h-16 w-auto md:block"
  //         />
  //       </div>
  //       <div className="flex flex-col gap-8">
  //         <div className="flex flex-col gap-16">
  //           <div className="flex flex-col gap-8">
  //             <h1 className="font-semibold text-3xl">Discover Expertise and Communities like never before</h1>
  //             <div className="flex flex-col gap-8">
  //               <div className="flex gap-3 items-center h-5">
  //                 <FaCheck />
  //                 <p className="font-normal text-2xl">Find experts who actually help.</p>
  //               </div>
  //               <div className="flex gap-3 items-center h-5">
  //                 <FaCheck />
  //                 <p className="font-normal text-2xl">Book sessions instantly.</p>
  //               </div>
  //               <div className="flex gap-3 items-center h-5">
  //                 <FaCheck />
  //                 <p className="font-normal text-2xl">No more endless searching.</p>
  //               </div>
  //             </div>
  //           </div>
  //           <div className="flex justify-center">
  //             <Image
  //               src={Login_laptop || "/placeholder.svg"}
  //               alt="GuildUp"
  //               className="h-[360px] w-auto md:block -mt-8"
  //               />
  //           </div>
  //         </div>
  //         <div className="text-center w-full">
  //           <p>Are you an expert looking to create a page?</p>
  //           <p>Become a Creator</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };

import Image from "next/image";
import guildup_logo from './../../../public/svg/GuildUp_Logo_Light.svg';
import { FaCheck } from "react-icons/fa";
import Login_laptop from "./../../../public/Login_laptop.png";

export const UserHeroSection: React.FC = () => {
    return (
      <div className="min-h-screen w-1/2 bg-white flex flex-col items-start justify-between p-8 gap-8 border border-background">
        <div className="flex justify-center w-full">
          <Image
            src={guildup_logo || "/placeholder.svg"}
            alt="GuildUp"
            className="h-16 w-auto md:block"
          />
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex flex-col gap-8">
            <h1 className="font-semibold text-3xl">
              Discover Expertise and Communities like never before
            </h1>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 items-center h-5">
                <FaCheck />
                <p className="font-normal text-2xl">Find experts who actually help.</p>
              </div>
              <div className="flex gap-3 items-center h-5">
                <FaCheck />
                <p className="font-normal text-2xl">Book sessions instantly.</p>
              </div>
              <div className="flex gap-3 items-center h-5">
                <FaCheck />
                <p className="font-normal text-2xl">No more endless searching.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Image
              src={Login_laptop || "/placeholder.svg"}
              alt="GuildUp"
              className="h-[360px] w-auto object-contain"
            />
          </div>
        </div>
        <div className="text-center -mt-32 w-full">
          <p>Are you an expert looking to create a page?</p>
          <p>Become a Creator</p>
        </div>
      </div>
    );
  };