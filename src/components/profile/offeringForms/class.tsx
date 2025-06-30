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
import {
  OFFERING_TYPES,
  StringConstants,
} from "@/components/common/CommonText";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, Info } from "lucide-react";
import React from "react";

interface ClassFormData {
  title: string;
  description: string;
  type: string;
  total_price: number;
  schedule: {
    days_of_week: string[];
    time: string;
  };
  start_date: string;
  duration_per_session: number;
  is_private: boolean;
  meeting_link_option: string;
  custom_meeting_link: string;
  max_attendees: number;
}

interface ClassFormProps {
  formData: ClassFormData;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleOfferingSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  offeringCreated: boolean;
}

const daysOfWeek = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

const PLATFORM_COMMISSION_RATE = 0.118;
const EXPERT_PAYOUT_RATE = 1 - PLATFORM_COMMISSION_RATE;

function calculateExpertPayout(priceInclGst: number): string {
  const expertAmount = priceInclGst * EXPERT_PAYOUT_RATE;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(expertAmount);
}

const ClassForm = ({
  formData,
  setFormData,
  handleOfferingSubmit,
  loading,
  offeringCreated,
}: ClassFormProps) => {
  const handleDayToggle = (day: string) => {
    const currentDays = formData.schedule?.days_of_week || [];
    let updatedDays;

    if (currentDays.includes(day)) {
      updatedDays = currentDays.filter((d) => d !== day);
    } else {
      updatedDays = [...currentDays, day];
    }

    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        days_of_week: updatedDays,
      },
    });
  };

  const [batchType, setBatchType] = React.useState<"new" | "ongoing">("new");

  return (
    <form onSubmit={handleOfferingSubmit} className="space-y-6">
      {/* Class Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Class Details</h3>

        <div className="space-y-2">
          <Label htmlFor="title">
            Title<span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Evening Yoga Batch – 7 PM"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Description<span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
            placeholder="Relaxing yoga sessions for all levels. Perfect for beginners and experienced practitioners..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">
            Type<span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your offering type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consultation">
                {OFFERING_TYPES.CONSULTATION}
              </SelectItem>
              <SelectItem value="webinar">{OFFERING_TYPES.WEBINAR}</SelectItem>
              <SelectItem value="package">{OFFERING_TYPES.PACKAGE}</SelectItem>
              <SelectItem value="class">{OFFERING_TYPES.CLASS}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Pricing Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 md:items-start">
          <div className="flex flex-col justify-start w-full">
            <Label htmlFor="total_price">
              Monthly Price ({StringConstants.INR})
              <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-start text-xs text-muted-foreground mb-1 gap-1">
              <Info className="h-4 w-4 mt-0.5" />
              <span>10% platform fee + taxes, no hidden charges.</span>
            </div>
            <Input
              id="total_price"
              type="number"
              min={0}
              value={formData.total_price}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  total_price: Number(value),
                });
              }}
              required
            />
            <div
              className={`transition-all duration-300 overflow-hidden ${
                formData.total_price > 0 ? "max-h-[56px] mt-2" : "max-h-0 mt-0"
              }`}
            >
              <div className="rounded-md border p-3 bg-gray-50">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">
                    You will receive
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    {calculateExpertPayout(formData.total_price)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-start w-full ">
            <Label htmlFor="max_attendees" className="mt-2">
              Max Attendees
            </Label>
            <Input
              id="max_attendees"
              type="number"
              value={formData.max_attendees}
              className="mt-3"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_attendees: Number(e.target.value),
                })
              }
              placeholder="50"
            />
          </div>
        </div>
      </div>

      {/* Batch Type */}
      <div className="space-y-2">
        <Label htmlFor="batch_type">
          Batch Type<span className="text-red-500">*</span>
        </Label>
        <Select
          value={batchType}
          onValueChange={(value) => setBatchType(value as "new" | "ongoing")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Batch Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New Batch</SelectItem>
            <SelectItem value="ongoing">Ongoing Batch</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Schedule Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4 items-start md:items-start">
          <div className="space-y-2 w-full">
            <Label htmlFor="total_price">
              Monthly Price ({StringConstants.INR})
              <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-start text-xs text-muted-foreground mb-1 gap-1">
              <Info className="h-4 w-4 mt-0.5" />
              <span>10% platform fee + taxes, no hidden charges.</span>
            </div>
            <Input
              id="total_price"
              type="number"
              min={0}
              value={formData.total_price}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  total_price: Number(value),
                });
              }}
              required
            />
            {formData.total_price > 0 && (
              <div className="rounded-md border p-3 bg-gray-50 mt-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">
                    You will receive
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    {calculateExpertPayout(formData.total_price)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 w-full">
            <Label htmlFor="max_attendees">Max Attendees</Label>
            <Input
              id="max_attendees"
              type="number"
              value={formData.max_attendees}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_attendees: Number(e.target.value),
                })
              }
              placeholder="50"
            />
          </div>
        </div>
      </div>
      {/* Meeting Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Meeting Configuration</h3>

        <div className="space-y-2">
          <Label htmlFor="meeting_link_option">
            Meeting Link Option<span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.meeting_link_option}
            onValueChange={(value) =>
              setFormData({ ...formData, meeting_link_option: value })
            }
          >
            <SelectTrigger disabled={batchType === "ongoing"}>
              <SelectValue placeholder="Select meeting link option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto_generate">
                Auto-generate recurring link
              </SelectItem>
              <SelectItem value="custom">Use custom meeting link</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(formData.meeting_link_option === "custom" ||
          batchType === "ongoing") && (
          <div className="space-y-2">
            <Label htmlFor="custom_meeting_link">
              Custom Meeting Link<span className="text-red-500">*</span>
            </Label>
            <Input
              id="custom_meeting_link"
              type="url"
              value={formData.custom_meeting_link}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  custom_meeting_link: e.target.value,
                })
              }
              placeholder="https://zoom.us/j/..."
              required={
                formData.meeting_link_option === "custom" ||
                batchType === "ongoing"
              }
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="is_private"
            checked={formData.is_private}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_private: checked })
            }
          />
          <Label htmlFor="is_private">
            Private Class (Custom offer - won&apos;t appear on your public
            profile)
          </Label>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          className="bg-primary text-white"
          disabled={
            loading ||
            !formData.schedule?.days_of_week?.length ||
            !formData.schedule?.time
          }
        >
          {loading ? "Creating..." : "Create Class"}
        </Button>
      </div>
    </form>
  );
};

export default ClassForm;