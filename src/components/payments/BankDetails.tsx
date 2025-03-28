"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";

interface BankDetailsProps{
  onClose: ()=> void;
}
const BankDetails = ({ onClose }: BankDetailsProps) => {
  const {user}= useSelector((state: RootState)=> state.user);
  const userId= user?._id;
  const [bankDetails, setBankDetails] = React.useState({
    benificiaryName: "",
    accountNumber: "",
    ifsc: "",
    pan: "ABCDE1234F"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/bank-details`,
        {
          user_id: userId,
          bank_details: bankDetails,
        }
      );
      console.log("thsi is handle save response ",response.data);
      
      setBankDetails({
        benificiaryName: "",
        accountNumber: "",
        ifsc: "",
        pan: "ABCDE1234F"
      })
      if (response.data.r === "s") {
        onClose();
        toast.success(response.data.data);
        return response.data.data;
      } else if (response.data.r === "e") {
        let errorMsg = "";
        if (Array.isArray(response.data.e)) {
          errorMsg = response.data.e.map((err: any) => err.message).join(", ");
        } else {
          errorMsg = response.data.e;
        }
        toast.error(errorMsg);
        throw new Error(errorMsg);
      } else {
        const fallbackError = "Unexpected response from server.";
        toast.error(fallbackError);
        throw new Error(fallbackError);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update bank details.");
      console.error("Error updating bank details:", error);
      throw error;
    }
  };

  return (
    <DialogContent className="bg-white p-6 rounded-lg w-full max-w-md">
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold text-[#19191A] leading-7 front-[Source Sans Pro]">Your Bank Details</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 mt-4">
        {/* Account Holder's Name */}
        <div>
          <label className="block text-[#19191A] text-base font-normal leading-7 front-[Source Sans Pro]">Account holder’s name</label>
          <input
            type="text"
            name="benificiaryName"
            value={bankDetails.benificiaryName}
            onChange={handleChange}
            placeholder="Enter account holder’s name"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Account Number */}
        <div>
          <label className="block text-[#19191A] text-base font-normal leading-7 front-[Source Sans Pro]">Account number</label>
          <input
            type="text"
            name="accountNumber"
            value={bankDetails.accountNumber}
            onChange={handleChange}
            placeholder="Enter your account number"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* IFSC Code */}
        <div>
          <label className="block text-[#19191A] text-base font-normal leading-7 front-[Source Sans Pro]">IFSC Code</label>
          <input
            type="text"
            name="ifsc"
            value={bankDetails.ifsc}
            onChange={handleChange}
            placeholder="Enter branch IFSC code"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* PAN Card */}
        {/* <div>
          <label className="block text-[#19191A] text-base font-normal leading-7 front-[Source Sans Pro]">PAN Card</label>
          <input
            type="text"
            name="pan"
            value={bankDetails.pan}
            onChange={handleChange}
            placeholder="Enter PAN Details"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div> */}
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-16">
        <Button
          onClick={handleSave}
          className="bg-blue-600 text-white px-10 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Save
        </Button>
      </div>

      {/* Close Button */}
      {/* <DialogClose className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">✖</DialogClose> */}
    </DialogContent>
  );
};

export default BankDetails;
