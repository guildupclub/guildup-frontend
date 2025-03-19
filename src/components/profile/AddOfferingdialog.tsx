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

interface AddOfferingDialogProps {
  onOfferingAdded: () => void;
}

export function AddOfferingDialog({ onOfferingAdded }: AddOfferingDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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

  // Bank details form state
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    panCard: "",
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
    is_free: false,
    tags: "",
  });

  useEffect(() => {
    if (open) {
      // If bank details are added, skip to step 2
      if (user_isBankDetailsAdded) {
        // If calendar is also connected, skip to step 3
        if (user_iscalendarConnected) {
          setCurrentStep(3);
          setCalendarConnected(true);
        } else {
          setCurrentStep(2);
        }
      }
    }
  }, [open, user_isBankDetailsAdded, user_iscalendarConnected]);

  useEffect(() => {
    return () => {
      // Clean up interval on component unmount
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const checkCalendarConnection = async () => {
    if (!user?._id) return false;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/calendar/check-connection/${user._id}`
      );

      if (response.data.r === "s" && response.data.data.connected) {
        return true;
      }
    } catch (error) {
      console.error("Error checking calendar connection:", error);
    }
    return false;
  };

  const handleBankDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    setLoading(true);
    try {
      // Send bank details to verification endpoint
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/bank-details-verify`,
        {
          user_id: user._id,
          bank_details: {
            benificiaryName: bankDetails.accountHolderName,
            accountNumber: bankDetails.accountNumber,
            ifsc: bankDetails.ifscCode,
            pan: bankDetails.panCard,
          },
        }
      );

      if (response.data.r === "s") {
        // If successful, proceed to step 2
        setCurrentStep(2);
      } else {
        // Handle error
        toast.error("Failed to verify bank details. Please try again.");
        // alert("Failed to verify bank details. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying bank details:", error);
      toast.error("An error occurred while verifying bank details.");
      // alert("An error occurred while verifying bank details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCalendarConnect = async () => {
    if (!user?._id) return;

    setLoading(true);
    let newTab: Window | null = null;
    try {
      // Redirect to calendar access endpoint
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/calendar/calendar-access/${user._id}`
      );
      console.log(response);

      // Check if calendar is already connected
      if (
        response.data.r === "s" &&
        response.data.data === "Calendar already connected"
      ) {
        console.log("Calendar already connected");
        setCalendarConnected(true);
        setLoading(false);
        // Automatically proceed to step 3
        setCurrentStep(3);
        toast.success("Calendar already connected.");
        return;
      }

      console.log(response.data.data.authUrl);
      if (response.data.data.authUrl) {
        console.log("Redirecting...");
        newTab = window.open(response.data.data.authUrl, "_blank");
        if (!newTab) {
          toast.warning("Pop-up blocked! Please allow pop-ups for this site.");
          setLoading(false);
          return;
        }

        // Set flag that auth window is open
        setAuthWindowOpen(true);

        // Start polling to check if calendar is connected
        const interval = setInterval(async () => {
          // Check if the popup window is closed
          if (newTab && newTab.closed) {
            const connectionStatus = await checkCalendarConnection();
            if (connectionStatus) {
              setCalendarConnected(true);
              clearInterval(interval);
              setPollingInterval(null);
              setAuthWindowOpen(false);
              setLoading(false);
              toast.success("Calendar successfully connected.");
            } else {
              setLoading(false);
              toast.error("Failed to connect calendar. Please try again.");
            }
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
    setCurrentStep(3);
  };

  const handleOfferingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          alert("Pop-up blocked! Please allow pop-ups for this site.");
        }
        return;
      }

      if (response.data.r === "s") {
        setOpen(false);
        onOfferingAdded();
        // Reset form and step
        setCurrentStep(1);
        setBankDetails({
          accountHolderName: "",
          accountNumber: "",
          ifscCode: "",
          panCard: "",
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
          is_free: false,
          tags: "",
        });
      }
    } catch (error) {
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
    // Reset to step 1 only if bank details are not added
    if (!user_isBankDetailsAdded) {
      setCurrentStep(1);
    } else if (!user_iscalendarConnected) {
      setCurrentStep(2);
    } else {
      setCurrentStep(3);
    }

    setBankDetails({
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      panCard: "",
    });

    // Only reset calendar connected if not already connected in Redux
    if (!user_iscalendarConnected) {
      setCalendarConnected(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleDialogClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="default"
          className={`text-white bg-primary hover:bg-primary/90 text-primary-foreground shadow transition-all duration-300 ${
            isAdmin ? "" : "bg-blue-300 cursor-not-allowed hover:bg-blue-300"
          }`}
          disabled={!isAdmin}
        >
          {StringConstants.ADD_OFFERING}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] bg-card">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 1 && "Your Bank Details"}
            {currentStep === 2 && "Link your Calendar"}
            {currentStep === 3 && StringConstants.CREATE_NEW_OFFERING}
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        {/* <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep === step
                      ? "border-primary bg-primary text-white"
                      : currentStep > step
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-0.5 ${
                      currentStep > step ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div> */}

        {/* Step 1: Bank Details */}
        {currentStep === 1 && (
          <div className="flex">
            <div className="w-1/2 pr-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white mr-2">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Get Paid Easily</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your bank details to receive earnings from your
                    consultations and digital services.
                  </p>
                </div>
              </div>

              <div className="mt-6 opacity-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 text-gray-500 mr-2">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Manage Bookings Seamlessly</h3>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll automatically sync appointments to your Google
                      Calendar. Stay organized effortlessly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 opacity-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 text-gray-500 mr-2">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Publish Your First Offering</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first offering and start earning. 
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-1/2 border-l pl-4">
              <form onSubmit={handleBankDetailsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountHolderName">
                    Account holder&apos;s name
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
                  <Label htmlFor="accountNumber">Account number</Label>
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
                  <Label htmlFor="ifscCode">IFSC Code</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="panCard">PAN Card</Label>
                  <Input
                    id="panCard"
                    value={bankDetails.panCard}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        panCard: e.target.value,
                      })
                    }
                    placeholder="Enter PAN Details"
                    required
                  />
                </div>

                <div className="flex justify-end">
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
        )}

        {/* Step 2: Calendar Integration */}
        {currentStep === 2 && (
          <div className="flex">
            <div className="w-1/3 pr-4">
              <div className="flex items-start opacity-50">
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

              <div className="mt-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white mr-2">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Manage Bookings Seamlessly</h3>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll automatically sync appointments to your Google
                      Calendar. Stay organized effortlessly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 opacity-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 text-gray-500 mr-2">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Publish Your First Offering</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your bank details to receive earnings from your
                      consultations and digital services.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-2/3 border-l pl-4">
              <form onSubmit={handleCalendarSubmit} className="space-y-4">
                <div className="text-center space-y-4 py-8">
                  <h2 className="text-xl font-semibold">Link your Calendar</h2>
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
        )}

        {/* Step 3: Create Offering */}
        {currentStep === 3 && (
          <div className="flex">
            <div className="w-1/3 pr-4">
              <div className="flex items-start opacity-50">
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

              <div className="mt-6 opacity-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white mr-2">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium">Manage Bookings Seamlessly</h3>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll automatically sync appointments to your Google
                      Calendar. Stay organized effortlessly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white mr-2">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Publish Your First Offering</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your bank details to receive earnings from your
                      consultations and digital services.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-2/3 border-l pl-4">
              <form onSubmit={handleOfferingSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter offering title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe your offerings"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your offering type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">
                        {OFFERING_TYPES.CONSULTATION}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">{StringConstants.PRICE} (INR)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price.amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: {
                            ...formData.price,
                            amount: Number(e.target.value),
                          },
                          is_free: Number(e.target.value) === 0,
                        })
                      }
                      min="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discounted_price">
                      {StringConstants.DISCOUNTED_PRICE} (INR)
                    </Label>
                    <Input
                      id="discounted_price"
                      type="number"
                      value={formData.discounted_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discounted_price: Number(e.target.value),
                        })
                      }
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">
                      {StringConstants.DURATION} (Mins)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: Number(e.target.value),
                        })
                      }
                      min="15"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">
                      {StringConstants.TAGS} (Comma - Separate)
                    </Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder="e.g., Design, Technology, Business"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary text-white"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create offerings"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
