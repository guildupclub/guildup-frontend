"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaWallet } from "react-icons/fa";
import { AiOutlineBank } from "react-icons/ai";
import { RiMoneyDollarCircleLine, RiMoneyPoundCircleFill, RiMoneyRupeeCircleLine } from "react-icons/ri";
import { IoMdArrowDropdown } from "react-icons/io";
import { DialogTrigger } from "@/components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import BankDetails from "./BankDetails";

const Dashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // constant icon size
  const iconClass = "w-6 h-6 md:w-7 md:h-7 text-black";

  return (
    <div className="flex justify-center items-center bg-gray-100 w-full p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
        {/* Balance Card */}
        <Card className="p-3 bg-card shadow-md border-gray-300">
          <CardHeader className="flex flex-row justify-between items-center -p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <FaWallet className={iconClass} />
              <CardTitle className="text-base md:text-lg text-[#19191A] font-semibold leading-6">Balance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center items-center -p-6">
            <CardDescription className="text-2xl md:text-3xl text-[#4A4A4A] font-semibold mt-6 md:mt-10 leading-10">₹10,000</CardDescription>
          </CardContent>
        </Card>

        {/* Lifetime Earning Card */}
        <Card className="p-3 bg-card shadow-md border-gray-300">
          <CardHeader className="flex flex-row justify-between items-center -p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <RiMoneyRupeeCircleLine className={iconClass} />
              <CardTitle className="text-base md:text-lg text-[#19191A] font-semibold leading-6">Lifetime Earning</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center items-center -p-6">
            <CardDescription className="text-2xl md:text-3xl text-[#4A4A4A] font-semibold mt-6 md:mt-10 leading-10">₹10,000</CardDescription>
          </CardContent>
        </Card>

        {/* Withdrawal Card */}
        <Card className="p-3 bg-card shadow-md border-gray-300">
          <CardHeader className="flex flex-row justify-between items-center -p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <RiMoneyRupeeCircleLine className={iconClass} />
              <CardTitle className="text-base md:text-lg text-[#19191A] font-semibold leading-6">Withdrawal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center items-center -p-6">
            <CardDescription className="text-2xl md:text-3xl text-[#4A4A4A] font-semibold mt-6 md:mt-10 leading-10">₹10,000</CardDescription>
          </CardContent>
        </Card>

        {/* Bank Details Card */}
        <Card className="p-3 bg-card shadow-md border-gray-300 relative">
          <CardHeader className="flex flex-row justify-between items-center -p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <AiOutlineBank className={iconClass} />
              <CardTitle className="text-base md:text-lg text-[#19191A] font-semibold leading-6">Bank Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="bottom-0 absolute pb-3 pl-0">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <p
                  className="text-blue-600 underline font-semibold text-center cursor-pointer"
                  style={{
                    fontFamily: 'Source Sans Pro, sans-serif',
                    fontSize: '16px',
                    lineHeight: '20.11px',
                    letterSpacing: '0%',
                    textDecorationStyle: 'solid',
                    textDecorationThickness: 'auto'
                  }}
                >
                  Click to change
                </p>
              </DialogTrigger>
              <BankDetails onClose={() => setIsDialogOpen(false)}/>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
