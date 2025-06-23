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
import { Plus, Trash2 } from "lucide-react";

interface PackageFormData {
  title: string;
  description: string;
  type: string;
  total_price: number;
  // discounted_price: number;
  number_of_sessions: number;
  interval_between_sessions: number;
  session_duration: number;
  sessions: { date: string; time: string }[];
  is_private: boolean;
  meeting_link_option: string;
  custom_meeting_link: string;
  // tags: string;
}

interface PackageFormProps {
  formData: PackageFormData;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleOfferingSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  offeringCreated: boolean;
}

const PackageForm = ({
  formData,
  setFormData,
  handleOfferingSubmit,
  loading,
  offeringCreated,
}: PackageFormProps) => {
  const addSession = () => {
    const newSessions = [...formData.sessions, { date: "", time: "" }];
    setFormData({
      ...formData,
      sessions: newSessions,
      number_of_sessions: newSessions.length,
    });
  };

  const removeSession = (index: number) => {
    const newSessions = formData.sessions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      sessions: newSessions,
      number_of_sessions: newSessions.length,
    });
  };

  const updateSession = (
    index: number,
    field: "date" | "time",
    value: string
  ) => {
    const newSessions = [...formData.sessions];
    newSessions[index] = { ...newSessions[index], [field]: value };
    setFormData({
      ...formData,
      sessions: newSessions,
    });
  };

  return (
    <form onSubmit={handleOfferingSubmit} className="space-y-6">
      {/* Package Details Section */}
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
              <SelectItem value="consultation">
                {OFFERING_TYPES.CONSULTATION}
              </SelectItem>
              <SelectItem value="webinar">{OFFERING_TYPES.WEBINAR}</SelectItem>
              <SelectItem value="package">{OFFERING_TYPES.PACKAGE}</SelectItem>
              <SelectItem value="class">{OFFERING_TYPES.CLASS}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="coaching, therapy, personal development"
          />
        </div> */}
      </div>

      {/* Pricing Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pricing</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total_price">
              Total Price ({StringConstants.INR})
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="total_price"
              type="number"
              value={formData.total_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  total_price: Number(e.target.value),
                })
              }
              required
            />
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="discounted_price">
              Discounted Price ({StringConstants.INR})
            </Label>
            <Input
              id="discounted_price"
              type="number"
              value={formData.discounted_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discounted_price: Number(e.target.value),
                })
              }
            />
          </div> */}
        </div>
      </div>

      {/* Session Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Session Configuration</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Duration_of_Session */}
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

          {/* Number_of_Session */}
          <div className="space-y-2">
            <Label>
              Number of Sessions:
              <span className="text-red-500">*</span>
            </Label>
            {/* <div className="text-sm text-muted-foreground">
              Add sessions below to set the count
            </div> */}
            <Input
              id="number_of_sessions"
              type="number"
              value={formData.number_of_sessions}
              defaultValue={1}
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

          {/* Interval_between_two_sessions */}
          <div className="space-y-2">
            <Label htmlFor="interval_between_sessions">
              Interval Between Sessions (In Days)
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="interval_between_sessions"
              type="number"
              value={formData.interval_between_sessions}
              defaultValue={10}
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
            Private Package (Custom offer - wont&apos;t appear on your public
            profile)
          </Label>
        </div>
      </div>

      {/* Session Schedule */}
      {/* <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Session Schedule</h3>
          <Button
            type="button"
            onClick={addSession}
            variant="outline"
            size="sm"
            disabled={formData.sessions.length >= 20}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Session
          </Button>
        </div>

        {formData.sessions.length === 0 && (
          <div className="text-sm text-muted-foreground border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            No sessions added yet. Click &quot;Add Session&quot; to start
            scheduling your package sessions.
          </div>
        )}

        <div className="space-y-3">
          {formData.sessions.map((session, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 border rounded-lg"
            >
              <div className="flex-shrink-0">
                <span className="text-sm font-medium">Session {index + 1}</span>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={session.date}
                  onChange={(e) => updateSession(index, "date", e.target.value)}
                  required
                />
                <Input
                  type="time"
                  value={session.time}
                  onChange={(e) => updateSession(index, "time", e.target.value)}
                  required
                />
              </div>

              <Button
                type="button"
                onClick={() => removeSession(index)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {formData.sessions.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Total sessions: {formData.sessions.length} | Duration per session:{" "}
            {formData.session_duration} minutes
          </div>
        )}
      </div> */}

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
