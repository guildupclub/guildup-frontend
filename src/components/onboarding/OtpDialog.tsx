"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OtpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (otp: string) => void;
  phoneNumber: string;
}

export default function OtpDialog({
  isOpen,
  onClose,
  onSubmit,
  phoneNumber,
}: OtpDialogProps) {
  const [otp, setOtp] = useState("");

  const handleSubmit = () => {
    onSubmit(otp);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter OTP</DialogTitle>
          <DialogDescription>
            An OTP has been sent to your WhatsApp number: {phoneNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter your 6-digit OTP"
            maxLength={6}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}