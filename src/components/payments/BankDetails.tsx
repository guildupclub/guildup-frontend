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

interface BankDetailsProps{
  onClose: ()=> void;
}
const BankDetails = ({ onClose }: BankDetailsProps) => {
  const [bankDetails, setBankDetails] = React.useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    panCard: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log("Bank Details:", bankDetails);
    onClose();
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
            name="accountHolderName"
            value={bankDetails.accountHolderName}
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
            name="ifscCode"
            value={bankDetails.ifscCode}
            onChange={handleChange}
            placeholder="Enter branch IFSC code"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* PAN Card */}
        <div>
          <label className="block text-[#19191A] text-base font-normal leading-7 front-[Source Sans Pro]">PAN Card</label>
          <input
            type="text"
            name="panCard"
            value={bankDetails.panCard}
            onChange={handleChange}
            placeholder="Enter PAN Details"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
