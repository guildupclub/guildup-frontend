//@ts-nocheck
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

const daysOfWeek = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

const EditOfferingModal = ({
  offering,
  userId,
  communityId,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    ...offering,
    userId,
    communityId,
  });
  const [loading, setLoading] = useState(false);
  const hasBookings = (offering.bookings || 0) > 0;

  const isClass = formData.type === "class";
  const isDiscoveryCall = formData.type === "discovery-call";

  useEffect(() => {
    console.log("Initial formData:", formData);
  }, [])
  

  const canEditField = (field) => {
    const type = formData.type;
    if (
      type === "consultation" ||
      type === "discovery-call" ||
      type === "package"
    )
      return true;
    if (type === "webinar")
      return (
        !hasBookings ||
        !["price", "duration", "when", "meeting_link"].includes(field)
      );
    if (type === "class") {
      if (!hasBookings) return true;
      return ![
        "price",
        "duration",
        "when",
        "meeting_link",
        "days",
        "batch_type",
        "class_time",
      ].includes(field);
    }
    return false;
  };

  const handleDayToggle = (day) => {
    const days = formData.days || [];
    setFormData({
      ...formData,
      days: days.includes(day) ? days.filter((d) => d !== day) : [...days, day],
    });
  };

  const handleEditOffering = async (e) => {
    e.preventDefault();

    if (formData.price.amount < 0)
      return toast.error("Price cannot be negative");
    if (isDiscoveryCall && formData.price.amount > 200)
      return toast.error("Max price for Discovery Call is ₹200");
    if (isDiscoveryCall && formData.duration > 30)
      return toast.error("Max duration for Discovery Call is 30 mins");

    const payload = { ...formData };
    Object.keys(payload).forEach((key) => {
      if (!canEditField(key)) delete payload[key];
    });

    try {
      setLoading(true);
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/edit/${offering._id}`,
        payload
      );
      if (res.data.r === "s") {
        toast.success("Offering updated successfully");
        onUpdate();
        onClose();
      } else toast.error("Failed to update offering");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update offering");
    }
    setLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-card sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Offering</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEditOffering} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              disabled={!canEditField("title")}
              className={
                !canEditField("title") ? "opacity-50 cursor-not-allowed" : ""
              }
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              disabled={!canEditField("description")}
              className={
                !canEditField("description")
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
            />
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price (₹)</Label>
              <Input
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
                min={0}
                required
                disabled={!canEditField("price")}
                className={
                  !canEditField("price") ? "opacity-50 cursor-not-allowed" : ""
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (mins)</Label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: Number(e.target.value) })
                }
                required
                disabled={!canEditField("duration")}
                className={
                  !canEditField("duration")
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              />
            </div>
          </div>

          {/* Meeting Link */}
          <div className="space-y-2">
            <Label>Meeting Link</Label>
            <Input
              value={formData.meeting_link || ""}
              onChange={(e) =>
                setFormData({ ...formData, meeting_link: e.target.value })
              }
              disabled={!canEditField("meeting_link")}
              className={
                !canEditField("meeting_link")
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
            />
          </div>

          {/* Class Specific */}
          {isClass && (
            <>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date?.slice(0, 10) || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  disabled={!canEditField("when")}
                  className={
                    !canEditField("when") ? "opacity-50 cursor-not-allowed" : ""
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Class Time</Label>
                <Input
                  type="time"
                  value={formData.class_time || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, class_time: e.target.value })
                  }
                  disabled={!canEditField("class_time")}
                  className={
                    !canEditField("class_time")
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Batch Type</Label>
                <Select
                  value={formData.batch_type || "new"}
                  onValueChange={(v) =>
                    setFormData({ ...formData, batch_type: v })
                  }
                  disabled={!canEditField("batch_type")}
                >
                  {" "}
                  <SelectTrigger>
                    {" "}
                    <SelectValue placeholder="Select Batch Type" />{" "}
                  </SelectTrigger>{" "}
                  <SelectContent>
                    {" "}
                    <SelectItem value="new">New</SelectItem>{" "}
                    <SelectItem value="ongoing">Ongoing</SelectItem>{" "}
                  </SelectContent>{" "}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Days of Week</Label>
                <div className="grid grid-cols-4 gap-2">
                  {daysOfWeek.map((d) => (
                    <Button
                      key={d.value}
                      type="button"
                      variant={
                        formData.days?.includes(d.value) ? "default" : "outline"
                      }
                      disabled={!canEditField("days")}
                      onClick={() => handleDayToggle(d.value)}
                    >
                      {d.label}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Submit Controls */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-white"
            >
              {loading ? "Updating..." : "Update Offering"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOfferingModal;
