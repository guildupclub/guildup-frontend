"use client";

import { useState } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { StringConstants } from "../common/CommonText";
import { toast } from "sonner";

const EditOfferingModal = ({
  offering,
  userId,
  communityId,
  onClose,
  onUpdate,
}: any) => {
  const [formData, setFormData] = useState({
    ...offering,
    userId,
    communityId,
  });
  const [loading, setLoading] = useState(false);

  const hasBookings = (offering.bookings || 0) > 0;

  const canEditField = (fieldName: string) => {
    const type = formData.type;
    const bookingCount = formData.bookings || 0;
    const hasBookings = bookingCount > 0;

    console.log(
      "Checking edit permissions for field:",
      fieldName,
      "Type:",
      type,
      ", hasBookings:",
      hasBookings
    );

    return helper(type, fieldName, hasBookings);
  };

  const helper = (type: any, fieldName: any, hasBookings: boolean) => {
    if (type === "consultation") return true;
    if (type === "webinar") {
      if (!hasBookings) return true;
      return !["price", "duration", "when", "meeting_link"].includes(fieldName);
    }
    if (type === "discovery-call") return true;
    if (type === "package") return true;
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
      ].includes(fieldName);
    }
    return false;
  };
  

  const handleEditOffering = async (e: any) => {
    e.preventDefault();
    if (formData.price.amount < 0) {
      toast.error("Price cannot be negative.");
      return;
    }

    const payload = { ...formData };

    Object.keys(payload).forEach((key) => {
      if (!canEditField(key)) {
        delete payload[key];
      }
    });

    setLoading(true);
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/edit/${offering._id}`,
        payload
      );
      if (response.data.r === "s") {
        toast.success("Offering updated successfully");
        onUpdate();
        onClose();
      } else {
        toast.error("Failed to update offering");
      }
    } catch (error) {
      console.error("Error updating offering:", error);
      toast.error("Failed to update offering");
    }
    setLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>Edit Offering</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEditOffering} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title">Title</label>
            <Input
              id="title"
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
          <div className="space-y-2">
            <label htmlFor="description">Description</label>
            <Textarea
              id="description"
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
          <div className="space-y-2">
            <label htmlFor="type">Type</label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
              disabled
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="package">Package</SelectItem>
                <SelectItem value="class">Class</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="price">Price ({StringConstants.INR})</label>
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
                disabled={!canEditField("price")}
                className={
                  !canEditField("price") ? "opacity-50 cursor-not-allowed" : ""
                }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="duration">Duration (mins)</label>
              <Input
                id="duration"
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

          {formData.type === "webinar" && (
            <>
              <div className="space-y-2">
                <label htmlFor="meeting_link">Meeting Link</label>
                <Input
                  id="meeting_link"
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
              <div className="space-y-2">
                <label htmlFor="when">Start Date & Time</label>
                <Input
                  id="when"
                  type="datetime-local"
                  value={
                    formData.when
                      ? new Date(formData.when).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      when: new Date(e.target.value).toISOString(),
                    })
                  }
                  disabled={!canEditField("when")}
                  className={
                    !canEditField("when") ? "opacity-50 cursor-not-allowed" : ""
                  }
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="text-white" disabled={loading}>
              {loading ? "Updating..." : "Update Offering"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOfferingModal;
