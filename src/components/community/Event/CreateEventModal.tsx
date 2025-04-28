"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
}

export function CreateEventModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateEventModalProps) {
  const [formData, setFormData] = React.useState({
    eventName: "",
    description: "",
    attendees: "",
    recurring: "yes",
    date: "2025-02-06",
    time: "29:49",
    timezone: "America/New_York",
    zoomLink: "",
    sendNotification: "no",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Event Data:", formData);
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] p-0 bg-card text-muted border-0">
        <DialogHeader className="p-4">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-normal">
              Create Event
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Image upload and form fields */}
          <div className="grid grid-cols-[350px_1fr] gap-4 p-4">
            {/* Left side - Image upload */}
            <div>
              <div className="aspect-square bg-background rounded-lg flex items-center justify-center border border-dashed border-zinc-700">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-accent" />
                  <p className="text-sm text-accent">Upload event image</p>
                </div>
              </div>
            </div>

            {/* Right side - Form fields */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="eventName" className="text-sm mb-1 block">
                  Event Name
                </Label>
                <Input
                  id="eventName"
                  placeholder="Enter event name"
                  value={formData.eventName}
                  onChange={(e) =>
                    setFormData({ ...formData, eventName: e.target.value })
                  }
                  className="bg-background border-0"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm mb-1 block">
                  Event Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter details"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-background border-0 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="attendees" className="text-sm mb-1 block">
                  Who can attend this event?
                </Label>
                <Select
                  value={formData.attendees}
                  onValueChange={(value) =>
                    setFormData({ ...formData, attendees: value })
                  }
                >
                  <SelectTrigger className="bg-background border-0">
                    <SelectValue placeholder="Select attendees" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-zinc-800 text-muted-foreground">
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="invited">Invited Only</SelectItem>
                    <SelectItem value="members">Members Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Recurring, Date, Time, and Timezone */}
          <div className="grid grid-cols-4 gap-4 px-6">
            <div>
              <Label className="text-sm mb-1 block">Recurring event</Label>
              <Select
                value={formData.recurring}
                onValueChange={(value) =>
                  setFormData({ ...formData, recurring: value })
                }
              >
                <SelectTrigger className="bg-background border-0">
                  <SelectValue>Yes</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-card border-zinc-800 text-muted-foreground">
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-1 block">Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="bg-background border-0"
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">Time</Label>
              <Input
                className="bg-background"
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">Time zone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) =>
                  setFormData({ ...formData, timezone: value })
                }
              >
                <SelectTrigger className="bg-background border-0">
                  <SelectValue>America/New_York</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-card border-zinc-800">
                  <SelectItem value="America/New_York">GMT-5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Zoom Link */}
          <div className="px-6 pt-2">
            <Label htmlFor="zoomLink" className="text-sm mb-1 block ">
              Zoom link
            </Label>
            <Input
              id="zoomLink"
              placeholder="Enter link"
              value={formData.zoomLink}
              onChange={(e) =>
                setFormData({ ...formData, zoomLink: e.target.value })
              }
              className="bg-background border-0"
            />
          </div>

          <div className="px-6 mt-4">
            <Label className="text-sm mb-3 block">
              Send notification via email to attendees
            </Label>
            <RadioGroup
              value={formData.sendNotification}
              onValueChange={(value) =>
                setFormData({ ...formData, sendNotification: value })
              }
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="yes"
                  id="yes"
                  className="border-zinc-600"
                />
                <Label htmlFor="yes" className="text-sm font-normal">
                  Yes
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="no"
                  id="no"
                  className="border-zinc-600"
                />
                <Label htmlFor="no" className="text-sm font-normal">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-4 py-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-transparent hover:bg-background text-accent border-zinc-700 px-8"
            >
              Cancel
            </Button>
            <Button type="submit" className=" text-white px-10">
              Add
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
