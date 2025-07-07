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
import { Info } from "lucide-react";
import React from "react";

const PLATFORM_COMMISSION_RATE = 0.118;
const EXPERT_PAYOUT_RATE = 1 - PLATFORM_COMMISSION_RATE;

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  type: "consultation",
  price: {
    amount: 0,
    currency: "INR",
  },
  duration: 30,
  is_free: true,
  tags: "",
  start_time: "",
  link: "",
};

interface OfferingFormProps {
  formData: typeof INITIAL_FORM_STATE;
  setFormData: React.Dispatch<React.SetStateAction<typeof INITIAL_FORM_STATE>>;
  handleOfferingSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  offeringCreated: boolean;
}

function calculateExpertPayout(priceInclGst: number): string {
  const expertAmount = priceInclGst * EXPERT_PAYOUT_RATE;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(expertAmount);
}

const DiscoveryCallForm = ({
  formData,
  setFormData,
  handleOfferingSubmit,
  loading,
  offeringCreated,
}: OfferingFormProps) => {
    const [priceError, setPriceError] = React.useState<string | null>(null);
    const [durationError, setDurationError] = React.useState<string | null>(
      null
    );

    React.useEffect(() => {
      if(formData.duration > 30) {
        setFormData({ ...formData, duration: 30 });
      }
    }, []);
    // the initial time duration must be set to 30 minutes
    React.useEffect(() => {
      if (formData.duration > 30) {
        setDurationError("Duration must not exceed 30 minutes.");
      } else {
        setDurationError(null);
      }
    }, [formData.duration]);

  return (
    <form onSubmit={handleOfferingSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">
          Title<span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Discovery Call"
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
          placeholder="In this offering we will discuss about...."
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
            <SelectItem value="discovery-call">
              {OFFERING_TYPES.DISCOVERY_CALL}
            </SelectItem>
            <SelectItem value="consultation">
              {OFFERING_TYPES.CONSULTATION}
            </SelectItem>
            <SelectItem value="webinar">{OFFERING_TYPES.WEBINAR}</SelectItem>
            <SelectItem value="package">{OFFERING_TYPES.PACKAGE}</SelectItem>
            <SelectItem value="class">{OFFERING_TYPES.CLASS}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <Label htmlFor="price">
            {StringConstants.PRICE} ({StringConstants.INR})
            <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-start text-xs text-muted-foreground mb-1 gap-1">
            <Info className="h-4 w-4 mt-0.5" />
            <span>10% platform fee + taxes, no hidden charges.</span>
          </div>
          <Input
            id="price"
            type="number"
            min={0}
            max={200}
            value={formData.price.amount}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value < 0 || value > 200) {
                setPriceError("Price must be between ₹0 and ₹200.");
              } else {
                setPriceError(null);
              }
              setFormData({
                ...formData,
                price: {
                  ...formData.price,
                  amount: value,
                },
                is_free: value === 0,
              });
            }}
            required
          />

          {/* 👇 This block handles both error and payout info */}
          <div className="relative min-h-[48px] mt-1">
            {formData.price.amount > 0 &&
            formData.price.amount <= 200 &&
            !priceError ? (
              <div className="rounded-md border p-3 bg-gray-50">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">
                    You will receive
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    {calculateExpertPayout(formData.price.amount)}
                  </span>
                </div>
              </div>
            ) : priceError ? (
              <p className="text-sm text-red-600">{priceError}</p>
            ) : (
              // Placeholder to preserve height and avoid layout jump
              <div className="h-[48px]" />
            )}
          </div>
        </div>

        <div className="space-y-2 pt-[28px]">
          <Label htmlFor="duration">
            {StringConstants.DURATION} (Mins)
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value > 30) {
                setDurationError("Duration must not exceed 30 minutes.");
              } else {
                setDurationError(null);
              }
              setFormData({
                ...formData,
                duration: value,
              });
            }}
            required
          />
          {durationError && (
            <p className="text-sm text-red-600">{durationError}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          className="bg-primary text-white"
          disabled={loading || offeringCreated}
        >
          {loading
            ? "Creating..."
            : offeringCreated
            ? "Created!"
            : "Create offerings"}
        </Button>
      </div>
    </form>
  );
};

export default DiscoveryCallForm;
