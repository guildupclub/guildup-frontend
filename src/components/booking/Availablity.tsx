"use client";

import * as React from "react";
import axios from "axios";
import { toast } from "sonner";
import { CalendarClock, Check, Clock, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

interface AvailabilityProps {
  userId: string;
}

interface AvailabilityRowProps {
  day: string;
  value: { enabled: boolean; start: string; end: string };
  onChange: (val: { enabled: boolean; start: string; end: string }) => void;
  isLoading?: boolean;
}

type DayAvailability = {
  enabled: boolean;
  start: string;
  end: string;
};

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timeOptions = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

const handleSetAvailability = async (
  userId: string,
  availability: Record<string, DayAvailability>
) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/calendar/availability/${userId}`,
      { availability }
    );
    if (response.data.r === "s") {
      toast.success("Availability saved successfully!");
      return true;
    } else {
      toast.error("Failed to save availability.");
      return false;
    }
  } catch (error) {
    console.error("Error saving availability:", error);
    toast.error("An error occurred while saving availability.");
    return false;
  }
};

const getAvailability = async (userId: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/calendar/availability/${userId}`
    );
    if (response.data.r === "s") {
      return response.data.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching availability:", error);
    toast.error("An error occurred while fetching availability.");
    return null;
  }
};

export const Availability = ({ userId }: AvailabilityProps) => {
  const [availability, setAvailability] = React.useState(() => {
    const initial: Record<string, DayAvailability> = {};
    days.forEach((day) => {
      initial[day] = {
        enabled: day !== "Saturday" && day !== "Sunday",
        start: "09:00",
        end: "17:00",
      };
    });
    return initial;
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);
  const originalData = React.useRef<Record<string, DayAvailability> | null>(
    null
  );

  React.useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      const data = await getAvailability(userId);
      if (data && typeof data === "object") {
        // Check if data has the expected structure
        const hasValidStructure = days.every(
          (day) =>
            data[day] &&
            typeof data[day].enabled === "boolean" &&
            typeof data[day].start === "string" &&
            typeof data[day].end === "string"
        );

        if (hasValidStructure) {
          setAvailability(data);
          originalData.current = JSON.parse(JSON.stringify(data));
        } else {
          console.warn(
            "Retrieved availability data has invalid structure",
            data
          );
        }
      }
      setLoading(false);
    };

    fetchAvailability();
  }, [userId]);

  // Check for changes
  React.useEffect(() => {
    if (!originalData.current) return;

    const isChanged =
      JSON.stringify(availability) !== JSON.stringify(originalData.current);
    setHasChanges(isChanged);
  }, [availability]);

  const handleSave = async () => {
    setSaving(true);
    const success = await handleSetAvailability(userId, availability);
    if (success) {
      originalData.current = JSON.parse(JSON.stringify(availability));
      setHasChanges(false);
    }
    setSaving(false);
  };

  const handleReset = () => {
    if (originalData.current) {
      setAvailability(JSON.parse(JSON.stringify(originalData.current)));
      setHasChanges(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl text-muted">
              <CalendarClock className="h-5 w-5 text-primary" />
              Weekly Availability
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Set your availability for booking services.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={loading || saving}
              >
                Reset
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={loading || saving || !hasChanges}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {hasChanges ? (
                    "Save Changes"
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Saved
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {days.map((day, index) => (
              <React.Fragment key={day}>
                <AvailabilityRow
                  day={day}
                  value={availability[day]}
                  onChange={(val) => {
                    setAvailability((prev) => ({
                      ...prev,
                      [day]: val,
                    }));
                  }}
                />
                {index < days.length - 1 && <Separator className="my-2" />}
              </React.Fragment>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AvailabilityRow: React.FC<AvailabilityRowProps> = ({
  day,
  value,
  onChange,
  isLoading,
}) => {
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const h = Number.parseInt(hour);
    const suffix = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}:${minute} ${suffix}`;
  };

  return (
    <div className="flex flex-col md:flex-row lg:items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <Switch
          id={`${day}-switch`}
          checked={value.enabled}
          onCheckedChange={(checked) =>
            onChange({ ...value, enabled: checked })
          }
          disabled={isLoading}
        />
        <label
          htmlFor={`${day}-switch`}
          className={`w-24 font-medium ${
            value.enabled ? "text-muted" : "text-muted-foreground"
          }`}
        >
          {day}
        </label>
      </div>
      {!value.enabled ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Unavailable</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-muted-foreground py-2 md:py-0">
          <Select
            value={value.start}
            onValueChange={(val) => onChange({ ...value, start: val })}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Start time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={`start-${time}`} value={time}>
                  {formatTime(time)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-muted-foreground">to</span>

          <Select
            value={value.end}
            onValueChange={(val) => onChange({ ...value, end: val })}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="End time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={`end-${time}`} value={time}>
                  {formatTime(time)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default Availability;
