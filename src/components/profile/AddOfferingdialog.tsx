"use client";
import { useState, useEffect } from "react";
import type React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  OFFERING_TYPES,
  StringConstants,
} from "@/components/common/CommonText";
import { toast } from "sonner";
import Link from "next/link";

interface AddOfferingDialogProps {
  onOfferingAdded: () => void;
}

export function AddOfferingDialog({ onOfferingAdded }: AddOfferingDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [offeringCreated, setOfferingCreated] = useState(false);

  const user = useSelector((state: RootState) => state.user.user);
  const communityId = useSelector(
    (state: RootState) => state.community.communityId
  );
  const memberDetails = useSelector(
    (state: RootState) => state.member.memberDetails
  );
  const isAdmin = memberDetails?.is_owner || memberDetails?.is_moderator;

  const user_isBankDetailsAdded = useSelector(
    (state: RootState) => state.channel.activeCommunity?.user_isBankDetailsAdded
  );
  const user_iscalendarConnected = useSelector(
    (state: RootState) =>
      state.channel.activeCommunity?.user_iscalendarConnected
  );
  const isBankAdded = useSelector((state: RootState) => state.user.isBankAdded);
  const isCalendarConnected = useSelector(
    (state: RootState) => state.user.isCalendarConnected
  );

  // Bank details form state
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
  });

  // Calendar integration state
  const [calendarConnected, setCalendarConnected] = useState(false);

  const [authWindowOpen, setAuthWindowOpen] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Offering form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "consultation",
    price: {
      amount: 0,
      currency: "INR",
    },
    discounted_price: 0,
    duration: 60,
    is_free: true,
    tags: "",
  });

  useEffect(() => {
    if (open) {
      if (currentStep === 1 && !offeringCreated) {
        if (isBankAdded || user_isBankDetailsAdded) {
          if (isCalendarConnected || user_iscalendarConnected) {
            setCurrentStep(1);
            setCalendarConnected(true);
          } else {
            setCurrentStep(2);
          }
        } else {
          setCurrentStep(1);
        }
      }
    }
  }, [
    open,
    isBankAdded,
    user_isBankDetailsAdded,
    isCalendarConnected,
    user_iscalendarConnected,
    currentStep,
    offeringCreated,
  ]);

  useEffect(() => {
    return () => {
      // Clean up interval on component unmount
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handleBankDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    setLoading(true);
    try {
      // Send bank details to verification endpoint
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/bank-details`,
        {
          user_id: user._id,
          bank_details: {
            benificiaryName: bankDetails.accountHolderName,
            accountNumber: bankDetails.accountNumber,
            ifsc: bankDetails.ifscCode,
          },
        }
      );

      if (response.data.r === "s") {
        toast.success("Bank details added successfully!");
        // Close dialog and trigger callback to refresh offerings
        setOpen(false);
        onOfferingAdded();

        // Reset form and state
        setCurrentStep(1);
        setOfferingCreated(false);
        setBankDetails({
          accountHolderName: "",
          accountNumber: "",
          ifscCode: "",
        });

        // Only reset calendar connected if not already connected in Redux
        if (!user_iscalendarConnected && !isCalendarConnected) {
          setCalendarConnected(false);
        }

        setFormData({
          title: "",
          description: "",
          type: "consultation",
          price: {
            amount: 0,
            currency: "INR",
          },
          discounted_price: 0,
          duration: 60,
          is_free: true,
          tags: "",
        });
      } else {
        // Handle error
        toast.error("Failed to verify bank details. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying bank details:", error);
      toast.error("An error occurred while verifying bank details.");
    } finally {
      setLoading(false);
    }
  };
  const handleCalendarConnect = async () => {
    if (!user?._id) return;

    setLoading(true);
    let newTab: Window | null = null;
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/calendar/calendar-access/${user._id}`
      );

      if (
        response.data.r === "s" &&
        response.data.data === "Calendar already connected"
      ) {
        console.log("Calendar already connected");
        setCalendarConnected(true);
        setLoading(false);
        toast.success("Calendar already connected.");
        setCurrentStep(3);
        return;
      }

      if (response.data.data.authUrl) {
        toast.info("Opening calendar authorization...");
        const width = window.innerWidth * 0.9;
        const height = window.innerHeight * 0.9;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        newTab = window.open(
          response.data.data.authUrl,
          "_blank",
          `width=${width},height=${height},top=${top},left=${left}`
        );

        if (!newTab) {
          toast.warning("Pop-up blocked! Please allow pop-ups for this site.");
          setLoading(false);
          return;
        }

        setAuthWindowOpen(true);

        const interval = setInterval(() => {
          if (newTab && newTab.closed) {
            clearInterval(interval);
            setPollingInterval(null);
            setAuthWindowOpen(false);
            setLoading(false);
            setCalendarConnected(true);
            toast.success("Calendar connected successfully!");
            setCurrentStep(3);
          }
        }, 1000);

        setPollingInterval(interval);
      }
    } catch (error) {
      toast.error("Error connecting calendar. Please try again.");
      console.error("Error connecting calendar:", error);
      setLoading(false);
    }
  };

  const handleCalendarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Always go to bank details after calendar step
    setCurrentStep(3);
  };

  const handleOfferingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.discounted_price > formData.price.amount) {
      toast.error(
        "Discounted price cannot be greater than the original price."
      );
      return;
    }
    if (formData.discounted_price < 0) {
      toast.error("Discounted price cannot be negative.");
      return;
    }
    if (formData.price.amount < 0) {
      toast.error("Price cannot be negative.");
      return;
    }

    if (!user?._id || !communityId) return;

    setLoading(true);
    let newTab: Window | null = null;
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/create`,
        {
          ...formData,
          tags: formData.tags.split(",").map((tag) => tag.trim()),
          userId: user._id,
          communityId,
        }
      );

      if (response.data.data && response.data.data.authUrl) {
        newTab = window.open(response.data.data.authUrl, "_blank");
        if (!newTab) {
          toast.warning("Pop-up blocked! Please allow pop-ups for this site.");
        }
        setLoading(false);
        return;
      }

      if (response.data.r === "s") {
        toast.success("Offering created successfully!");
        setOfferingCreated(true);

        // Check what's the next step needed
        if (
          !isCalendarConnected &&
          !user_iscalendarConnected &&
          !calendarConnected
        ) {
          // If calendar is not connected, go to calendar step
          setCurrentStep(2);
        } else if (!isBankAdded && !user_isBankDetailsAdded) {
          // If bank details are not added, go to bank details step
          setCurrentStep(3);
        } else {
          // If everything is set up, close the dialog
          setOpen(false);
          onOfferingAdded();
          // Reset form
          setFormData({
            title: "",
            description: "",
            type: "consultation",
            price: {
              amount: 0,
              currency: "INR",
            },
            discounted_price: 0,
            duration: 60,
            is_free: true,
            tags: "",
          });
          setOfferingCreated(false);
        }
      }
    } catch (error) {
      toast.error("Error creating offering. Please try again.");
      console.error("Error creating offering:", error);
      if (newTab) {
        newTab.close();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
    // Reset to step 1 by default
    setCurrentStep(1);
    setOfferingCreated(false);

    setBankDetails({
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
    });

    // Only reset calendar connected if not already connected in Redux
    if (!user_iscalendarConnected && !isCalendarConnected) {
      setCalendarConnected(false);
    }

    // Reset form data
    setFormData({
      title: "",
      description: "",
      type: "consultation",
      price: {
        amount: 0,
        currency: "INR",
      },
      discounted_price: 0,
      duration: 60,
      is_free: true,
      tags: "",
    });
  };

  const handleSkipClick = () => {
    if (!user?._id) return;
    setOpen(false);
    // Reset form and step
    setCurrentStep(1);
    setBankDetails({
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      // panCard: "",
    });
    setCalendarConnected(false);
    setFormData({
      title: "",
      description: "",
      type: "consultation",
      price: {
        amount: 0,
        currency: "INR",
      },
      discounted_price: 0,
      duration: 60,
      is_free: true,
      tags: "",
    });

    toast.info(
      <span className="text-md">
        Users are unable to access your offerings until you add bank details.{" "}
        <Link
          href="/payments"
          className="underline text-blue-500"
          rel="noopener noreferrer"
        >
          Click here
        </Link>{" "}
        to set up your bank details or you can add them later from payments
        page.
      </span>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleDialogClose();
        else setOpen(true);
      }}
    >
      {isAdmin && (
        <DialogTrigger asChild>
          <Button
            variant="default"
            className={`${
              isAdmin ? "" : "bg-blue-300 cursor-not-allowed hover:bg-blue-300"
            }`}
            disabled={!isAdmin}
          >
            {StringConstants.ADD_OFFERING}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[900px] bg-card">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 3 && "Add Your Bank Details"}
            {currentStep === 2 && "Link your Calendar"}
            {currentStep === 1 && StringConstants.CREATE_NEW_OFFERING}
          </DialogTitle>
        </DialogHeader>

        {/* Step 3: Bank Details */}
        {currentStep === 3 && !isBankAdded && !user_isBankDetailsAdded && (
          <>
            <div className="hidden md:flex">
              <div className="w-1/2 pr-4">
                <div className="flex items-start opacity-50">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white mr-2">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium">Publish Your Offering</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your offering and start earning.
                    </p>
                  </div>
                </div>

                {calendarConnected ||
                isCalendarConnected ||
                user_iscalendarConnected ? (
                  <div className="mt-6 opacity-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white mr-2">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          Manage Bookings Seamlessly
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          We&apos;ll automatically sync appointments to your
                          Google Calendar. Stay organized effortlessly.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 opacity-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 text-gray-500 mr-2">
                        2
                      </div>
                      <div>
                        <h3 className="font-medium">
                          Manage Bookings Seamlessly
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          We&apos;ll automatically sync appointments to your
                          Google Calendar. Stay organized effortlessly.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white mr-2">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium">Get Paid Easily</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter your bank details to receive earnings from your
                        consultations and digital services.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-1/2 border-l pl-4">
                <form onSubmit={handleBankDetailsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountHolderName">
                      Account holder&apos;s name &nbsp;
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="accountHolderName"
                      value={bankDetails.accountHolderName}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          accountHolderName: e.target.value,
                        })
                      }
                      placeholder="Enter account holder's name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">
                      Account number &nbsp;
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="accountNumber"
                      value={bankDetails.accountNumber}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          accountNumber: e.target.value,
                        })
                      }
                      placeholder="Enter your account number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ifscCode">
                      IFSC Code &nbsp;<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ifscCode"
                      value={bankDetails.ifscCode}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          ifscCode: e.target.value,
                        })
                      }
                      placeholder="Enter branch IFSC code"
                      required
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSkipClick}
                    >
                      Skip
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary text-white"
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Save"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
            <div className="md:hidden flex flex-col items-center justify-center space-y-4 py-8">
              <div className="">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white mr-2">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Get Paid Easily</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your bank details to receive earnings from your
                      consultations and digital services.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t w-full">
                <form onSubmit={handleBankDetailsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountHolderName">
                      Account holder&apos;s name &nbsp;
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="accountHolderName"
                      value={bankDetails.accountHolderName}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          accountHolderName: e.target.value,
                        })
                      }
                      placeholder="Enter account holder's name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">
                      Account number &nbsp;
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="accountNumber"
                      value={bankDetails.accountNumber}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          accountNumber: e.target.value,
                        })
                      }
                      placeholder="Enter your account number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ifscCode">
                      IFSC Code &nbsp;<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ifscCode"
                      value={bankDetails.ifscCode}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          ifscCode: e.target.value,
                        })
                      }
                      placeholder="Enter branch IFSC code"
                      required
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSkipClick}
                    >
                      Skip
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary text-white"
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Save"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Calendar Integration */}
        {currentStep === 2 &&
          !isCalendarConnected &&
          !user_iscalendarConnected &&
          !calendarConnected && (
            <>
              {/* Web View */}
              <div className="hidden md:flex">
                <div className="w-1/3 pr-4">
                  <div className="flex items-start opacity-50">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white mr-2">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-medium">Publish Your Offerings</h3>
                      <p className="text-sm text-muted-foreground">
                        Create your offering and start earning.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white mr-2">
                        2
                      </div>
                      <div>
                        <h3 className="font-medium">
                          Manage Bookings Seamlessly
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          We&apos;ll automatically sync appointments to your
                          Google Calendar. Stay organized effortlessly.
                        </p>
                      </div>
                    </div>
                  </div>

                  {!isBankAdded && !user_isBankDetailsAdded && (
                    <div className="mt-6 opacity-50">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 text-gray-500 mr-2">
                          3
                        </div>
                        <div>
                          <h3 className="font-medium">Get Paid Easily</h3>
                          <p className="text-sm text-muted-foreground">
                            Enter your bank details to receive earnings from
                            your consultations and digital services.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-2/3 border-l pl-4">
                  <form onSubmit={handleCalendarSubmit} className="space-y-4">
                    <div className="text-center space-y-4 py-8">
                      <h2 className="text-xl font-semibold">
                        Link your Calendar
                      </h2>
                      <p className="text-muted-foreground">
                        for better and seamless booking
                      </p>

                      {calendarConnected ? (
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-6 h-6 text-green-600" />
                          </div>
                          <p className="text-green-600 font-medium">
                            Successfully connected with Google
                          </p>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleCalendarConnect}
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={loading}
                        >
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                            alt="Google"
                            className="w-5 h-5 mr-2"
                          />
                          Connect with Google
                        </Button>
                      )}
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="bg-primary text-white"
                        disabled={!calendarConnected}
                      >
                        Continue
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
              {/* Mobile View */}
              <div className="flex flex-col md:hidden items-center justify-center space-y-4 py-8">
                <div className="">
                  <div className="mt-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white mr-2">
                        2
                      </div>
                      <div>
                        <h3 className="font-medium">
                          Manage Bookings Seamlessly
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          We&apos;ll automatically sync appointments to your
                          Google Calendar. Stay organized effortlessly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <form onSubmit={handleCalendarSubmit} className="space-y-4">
                    <div className="text-center space-y-4 py-8">
                      <h2 className="text-xl font-semibold">
                        Link your Calendar
                      </h2>
                      <p className="text-muted-foreground">
                        for better and seamless booking
                      </p>

                      {calendarConnected ? (
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-6 h-6 text-green-600" />
                          </div>
                          <p className="text-green-600 font-medium">
                            Successfully connected with Google
                          </p>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleCalendarConnect}
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={loading}
                        >
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                            alt="Google"
                            className="w-5 h-5 mr-2"
                          />
                          Connect with Google
                        </Button>
                      )}
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="bg-primary text-white"
                        disabled={!calendarConnected}
                      >
                        Continue
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}

        {/* Step 1: Create Offering */}
        {currentStep === 1 && (
          <>
            {/* Web View */}
            <div className="hidden md:flex">
              <div className="w-1/3 pr-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white mr-2">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Publish Your Offerings</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your offering and start earning.
                    </p>
                  </div>
                </div>

                {!isCalendarConnected &&
                !user_iscalendarConnected &&
                !calendarConnected ? (
                  <div className="mt-6 opacity-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 text-gray-500 mr-2">
                        2
                      </div>
                      <div>
                        <h3 className="font-medium">
                          Manage Bookings Seamlessly
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          We&apos;ll automatically sync appointments to your
                          Google Calendar. Stay organized effortlessly.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 opacity-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white mr-2">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          Manage Bookings Seamlessly
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          We&apos;ll automatically sync appointments to your
                          Google Calendar. Stay organized effortlessly.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!isBankAdded && !user_isBankDetailsAdded ? (
                  <div className="mt-6 opacity-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 text-gray-500 mr-2">
                        3
                      </div>
                      <div>
                        <h3 className="font-medium">Get Paid Easily</h3>
                        <p className="text-sm text-muted-foreground">
                          Enter your bank details to receive earnings from your
                          consultations and digital services.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 opacity-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white mr-2">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium">Get Paid Easily</h3>
                        <p className="text-sm text-muted-foreground">
                          Enter your bank details to receive earnings from your
                          consultations and digital services.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-2/3 border-l pl-4">
                {formData.type === "consultation" ? (
                  <ConsultationForm
                    formData={formData}
                    setFormData={setFormData}
                    handleOfferingSubmit={handleOfferingSubmit}
                    loading={loading}
                    offeringCreated={offeringCreated}
                  />
                ) : (
                  <WebinarForm
                    formData={formData}
                    setFormData={setFormData}
                    handleOfferingSubmit={handleOfferingSubmit}
                    loading={loading}
                    offeringCreated={offeringCreated}
                  />
                )}

              </div>
            </div>
            {/* Mobile View */}
            <div className="md:hidden flex flex-col justify-center space-y-4">
              <div className="">
                <div className="mt-6">
                  <div className="flex ">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white mr-2">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium">Publish Your Offerings</h3>
                      <p className="text-sm text-muted-foreground">
                        Create your offering and start earning.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t">
                {formData.type === "consultation" ? (
                  <ConsultationForm
                    formData={formData}
                    setFormData={setFormData}
                    handleOfferingSubmit={handleOfferingSubmit}
                    loading={loading}
                    offeringCreated={offeringCreated}
                  />
                ) : (
                  <WebinarForm
                    formData={formData}
                    setFormData={setFormData}
                    handleOfferingSubmit={handleOfferingSubmit}
                    loading={loading}
                    offeringCreated={offeringCreated}
                  />
                )}

              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
