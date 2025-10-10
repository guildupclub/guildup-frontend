"use client";

import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { primary, white } from "@/app/colours";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { leadsDb } from "@/lib/leadFirebase";
import { toast } from "sonner";

interface LeadFormModalProps {
  program: string;
  triggerLabel?: string;
  variant?: "primary" | "outline";
  appearance?: "default" | "white"; // white button for dark/primary backgrounds
}

export default function LeadFormModal({ program, triggerLabel = "Get Started", variant = "outline", appearance = "default" }: LeadFormModalProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      await addDoc(collection(leadsDb, "programLeads"), {
        program,
        name,
        email,
        phone,
        message,
        createdAt: serverTimestamp(),
        source: "program-page",
      });

      setSuccess("Thanks! Our team will reach out shortly.");
      toast.success("Thank you! You will be contacted soon.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to submit. Please try again.");
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="px-5 py-3 rounded-lg"
          style={{
            backgroundColor: appearance === "white" ? "#FFFFFF" : (variant === "primary" ? primary : "transparent"),
            color: appearance === "white" ? primary : (variant === "primary" ? white : primary),
            border: appearance === "white" ? "none" : (variant === "primary" ? "none" : `2px solid ${primary}`),
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
          }}
        >
          {triggerLabel}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <h3 className="text-xl font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>Get your personalized plan</h3>
        <p className="text-sm mt-1 mb-4" style={{ fontFamily: "'Poppins', sans-serif", color: "#475569" }}>
          Share your details and we’ll reach out with next steps.
        </p>
        {error && <div className="text-red-600 text-sm mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{error}</div>}
        {success && <div className="text-green-700 text-sm mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          <input required placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          <textarea placeholder="Tell us a bit (optional)" value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border rounded-lg px-3 py-2 min-h-[80px]" />
          <button disabled={submitting} className="w-full px-5 py-3 rounded-lg" style={{ backgroundColor: primary, color: white, opacity: submitting ? 0.7 : 1, fontFamily: "'Poppins', sans-serif" }}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}


