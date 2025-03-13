"user client";
import { useState } from "react";
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
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  OFFERING_TYPES,
  StringConstants,
} from "@/components/common/CommonText";

interface AddOfferingDialogProps {
  onOfferingAdded: () => void;
}

export function AddOfferingDialog({ onOfferingAdded }: AddOfferingDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.user.user);
  const communityId = useSelector(
    (state: RootState) => state.community.communityId
  );
  const memberDetails = useSelector(
    (state: RootState) => state.member.memberDetails
  );
  const isAdmin = memberDetails?.is_owner || memberDetails?.is_moderator;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "mentorship",
    price: {
      amount: 0,
      currency: "INR",
    },
    discounted_price: 0,
    duration: 60,
    is_free: false,
    tags: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("in handle submit");
    e.preventDefault();
    if (!user?._id || !communityId) return;

    setLoading(true);
    let newTab: Window | null = null;
    try {
      // Open a new tab before making the API call
      //newTab = window.open("", "_blank");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/create`,
        {
          ...formData,
          tags: formData.tags.split(",").map((tag) => tag.trim()),
          userId: user._id,
          communityId,
        }
      );
      console.log(response);
      console.log(response.data.data.authUrl);
      if (response.data.data.authUrl) {
        console.log("Redirecting...");
        newTab = window.open(response.data.data.authUrl, "_blank");
        if (!newTab) {
          alert("Pop-up blocked! Please allow pop-ups for this site.");
        }
        return;
      }

      if (response.data.r === "s") {
        setOpen(false);
        onOfferingAdded();
        // Reset form
        setFormData({
          title: "",
          description: "",
          type: "mentorship",
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className={` text-white bg-primary hover:bg-primary/90 text-primary-foreground shadow transition-all duration-300 ${
            isAdmin ? "" : "bg-blue-300 cursor-not-allowed hover:bg-blue-300"
          }`}
          disabled={!isAdmin}
        >
          {StringConstants.ADD_OFFERING}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>{StringConstants.CREATE_NEW_OFFERING}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Describe your offering"
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
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="mentorship">Mentorship</SelectItem> */}
                {/* <SelectItem value="course">Course</SelectItem> */}
                <SelectItem value="consultation">
                  {OFFERING_TYPES.CONSULTATION}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">{StringConstants.DURATION} (Mins)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: Number(e.target.value) })
              }
              min="15"
              required
            />
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

          <div className="space-y-2">
            <Label htmlFor="tags">
              {StringConstants.TAGS} (comma-separated)
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

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {StringConstants.CANCEL}
            </Button>
            <Button type="submit" className="text-white" disabled={loading}>
              {loading ? "Creating..." : "Create Offering"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
