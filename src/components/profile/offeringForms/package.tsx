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
import { Info, Plus, Trash2 } from "lucide-react";

const PLATFORM_COMMISSION_RATE = 0.118;
const EXPERT_PAYOUT_RATE = 1 - PLATFORM_COMMISSION_RATE;

function calculateExpertPayout(priceInclGst: number): string {
  const expertAmount = priceInclGst * EXPERT_PAYOUT_RATE;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(expertAmount);
}

interface PackageFormData {
  title: string;
  description: string;
  type: string;
  total_price: number;
  session_duration: number;
  number_of_sessions: number;
  interval_between_sessions: number;
  meeting_link_option: string;
  custom_meeting_link: string;
  is_private: boolean;
}

interface PackageFormProps {
  formData: PackageFormData;
  setFormData: (data: PackageFormData) => void;
  handleOfferingSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  offeringCreated: boolean;
}

const PackageForm: React.FC<PackageFormProps> = ({
  formData,
  setFormData,
  handleOfferingSubmit,
  loading,
  offeringCreated,
}) => {
  return (
    <form onSubmit={handleOfferingSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Package Details</h3>

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
            placeholder="1:1 Coaching Program"
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
            placeholder="A comprehensive coaching program with multiple sessions..."
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
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pricing</h3>

        <div className="grid grid-cols-2 gap-4 items-start">
          <div className="space-y-2 w-full">
            <Label htmlFor="total_price">
              Total Price ({StringConstants.INR})
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  total_price: Number(e.target.value),
                })
              }
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
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Session Configuration</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="session_duration">
              Duration per Session (minutes)
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="session_duration"
              type="number"
              value={formData.session_duration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  session_duration: Number(e.target.value),
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="number_of_sessions">
              Number of Sessions<span className="text-red-500">*</span>
            </Label>
            <Input
              id="number_of_sessions"
              type="number"
              value={formData.number_of_sessions}
              min={1}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  number_of_sessions: Number(e.target.value),
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval_between_sessions">
              Interval Between Sessions (Days)
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="interval_between_sessions"
              type="number"
              value={formData.interval_between_sessions}
              min={0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  interval_between_sessions: Number(e.target.value),
                })
              }
              required
            />
          </div>
        </div>
      </div>

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
            <SelectTrigger>
              <SelectValue placeholder="Select meeting link option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto_generate">
                Auto-generate Google Meet links
              </SelectItem>
              <SelectItem value="custom">Use custom meeting link</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.meeting_link_option === "custom" && (
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
              required={formData.meeting_link_option === "custom"}
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
            Private Package (Custom offer - won&apos;t appear on public profile)
          </Label>
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
            : "Create Package"}
        </Button>
      </div>
    </form>
  );
};

export default PackageForm;