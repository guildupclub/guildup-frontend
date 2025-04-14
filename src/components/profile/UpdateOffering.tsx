"use client";

import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTrigger,
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

  const handleEditOffering = async (e: any) => {
    e.preventDefault();

    // if (offering.creatorId !== userId) {
    //   alert("You are not authorized to edit this offering.");
    //   return;
    // }
    if (formData.discounted_price > formData.price.amount) {
      toast.error("Discounted price cannot be greater than the original price.");
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

    setLoading(true);
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/edit/${offering._id}`,
        formData
      );
      if (response.data.r === "s") {
        toast.success("Offering updated successfully");
        onUpdate();
        onClose();
      }
      else if (response.data.r === "e") {
        toast.error("Offering updated successfully");
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error("Error updating offering:", error);
      alert("Failed to update offering");
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
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="type">Type</label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mentorship">Mentorship</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
              </SelectContent>
            </Select>
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
              />
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
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="discounted_price">
                {StringConstants.DISCOUNTED_PRICE} ({StringConstants.INR})
              </label>
              <Input
                id="discoounted_price"
                type="number"
                value={formData.discounted_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discounted_price: Number(e.target.value),
                    is_free: Number(e.target.value) === 0,
                  })
                }
                min="0"
                required
              />
            </div>
          
          </div>
          {/* <div className="space-y-2">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="e.g., Design, Technology, Business"
            />
          </div> */}
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
