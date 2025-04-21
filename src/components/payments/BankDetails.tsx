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
import { Loader2 } from "lucide-react";

interface BankDetailsProps{
  onClose: ()=> void;
}

const THROTTLE_DELAY = 5000; // 5 seconds

// Throttle function to prevent multiple clicks within a specified delay
const useThrottle = (callback: Function, delay: number) => {
  const lastRan = React.useRef(0);
  
  return React.useCallback((...args: any[]) => {
    const now = Date.now();
    if (now - lastRan.current >= delay) {
      callback(...args);
      lastRan.current = now;
    }
  }, [callback, delay]);
};

const BankDetails = ({ onClose }: BankDetailsProps) => {
  const {user}= useSelector((state: RootState)=> state.user);
  const userId= user?._id;
  const user_isBankDetailsAdded= user?.isBankDetailsAdded;
  const [bankDetails, setBankDetails] = React.useState({
    benificiaryName: "",
    accountNumber: "",
    ifsc: "",
  });
  const [initialBankDetails, setInitialBankDetails] = React.useState({
    benificiaryName: "",
    accountNumber: "",
    ifsc: "",
  });
  const [isChanged, setIsChanged] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [lastClickTime, setLastClickTime] = React.useState(0);
  const [isThrottled, setIsThrottled] = React.useState(false);
  const throttleTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Clear throttle timer on component unmount
  React.useEffect(() => {
    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);
  
  React.useEffect(() => {
    fetchBankDetails();
  }, [userId]);
  const fetchBankDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/bank-details?user_id=${userId}`
      );
      if(response.data.r === "s") {
        setInitialBankDetails(response.data.data);
        setBankDetails(response.data.data);
        setIsChanged(false);
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDetails((prevDetails) => {
      const updatedDetails = {
        ...prevDetails,
        [name]: value
      };
      setIsChanged(JSON.stringify(updatedDetails) !== JSON.stringify(initialBankDetails));
      return updatedDetails;
    });
  };

  const handleSaveImpl = async () => {
    // this will prevent multiple submissions within 2 seconds 
    // @tanishq can you if we need to change this to 1 second or 3 seconds
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      let response;
      if (user_isBankDetailsAdded){
        response = await axios.patch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/bank-details`,
          {
            user_id: userId,
            bank_details: bankDetails,
          }
        );
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/bank-details`,
          {
            user_id: userId,
            bank_details: bankDetails,
          }
        );
      }
      
      if (response.data.r === "s") {
        await fetchBankDetails();
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // Throttle the save function to prevent multiple calls within 2 seconds
  const handleSave = useThrottle(handleSaveImpl, THROTTLE_DELAY);

  // Alternative throttle implementation without custom hook
  const handleSaveWithThrottle = () => {
    const now = Date.now();
    if (now - lastClickTime < THROTTLE_DELAY) {
      // If less than 2 seconds have passed since the last click, ignore this click
      return;
    }
    
    // Update the last click time
    setLastClickTime(now);
    setIsThrottled(true);
    
    // Execute the save function
    handleSaveImpl();
    
    // Set a timer to remove the throttle state after the delay
    throttleTimerRef.current = setTimeout(() => {
      setIsThrottled(false);
    }, THROTTLE_DELAY);
  };

  // Determine if button should be disabled
  const isButtonDisabled = !isChanged || isSubmitting || isThrottled;
  
  // Determine what to display on the button
  const getButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
        </>
      );
    } else if (isThrottled) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...
        </>
      );
    } 
    return "Update";
  };

  return (
    <DialogContent className="bg-white p-6 rounded-lg w-full max-w-md">
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold text-[#19191A] leading-7 front-[Source Sans Pro]">Your Bank Details</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 mt-4">
        {/* Account Holder's Name */}
        <div>
          <label className="block text-[#19191A] text-base font-normal leading-7 front-[Source Sans Pro]">Account holder's name</label>
          <input
            type="text"
            name="benificiaryName"
            value={bankDetails.benificiaryName}
            onChange={handleChange}
            disabled={isSubmitting || isThrottled}
            placeholder="Enter account holder's name"
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
            disabled={isSubmitting || isThrottled}
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
            disabled={isSubmitting || isThrottled}
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
          onClick={handleSaveWithThrottle}
          className={`px-10 py-2 rounded-lg transition ${
            isButtonDisabled 
            ? "bg-blue-400 text-white cursor-not-allowed" 
            : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          disabled={isButtonDisabled}
        >
          {getButtonContent()}
        </Button>
      </div>

      {/* Close Button */}
      {/* <DialogClose className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">✖</DialogClose> */}
    </DialogContent>
  );
};

export default BankDetails;