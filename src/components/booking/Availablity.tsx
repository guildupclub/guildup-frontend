"use client";

import type React from "react";
import { useState } from "react";
import axios from "axios";
import {toast} from "sonner";

interface AvailabilityRowProps {
    day: string;
    value: { enabled: boolean; start: string; end: string };
    onChange: (val: { enabled: boolean; start: string; end: string }) => void;
}

type DayAvailability = {
    enabled: boolean;
    start: string;
    end: string;
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const timeOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00',
    '11:00', '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00', '20:00',
    '21:00', '22:00',
];

const handlesetAvailability = async (availability: Record<string, DayAvailability>) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/health`,
      { availability} // Replace with actual availability data
    );
    if (response.data.r === "s") {
      toast.success("Availability saved successfully!");
    } else {
      toast.error("Failed to save availability.");
    }
  } catch (error) {
    console.error("Error saving availability:", error);
    toast.error("An error occurred while saving availability.");
  }
};


export const Availablity = () => {
  const [availability, setAvailability] = useState(() => {
       const initial: Record<string, DayAvailability> = {};
        days.forEach((day) => {
          initial[day] = {
            enabled: day === "Saturday" || day === "Sunday",
            start: "9:00",
            end: "5:00",
          };
        });
        return initial;
      });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Availability</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md"
        onClick={() => handlesetAvailability(availability)}
        >
            Save
        </button>
       </div>
        <p className="text-sm text-gray-500">
          Set your availability for the selected service.
        </p>
      </div>
      <div className="flex flex-col gap-4">
      {days.map((day) => (
        <AvailabilityRow
            key={day}
            day={day}
            value={availability[day]} // pass values for this day
            onChange={(val) =>
            setAvailability((prev) => ({
                ...prev,
                [day]: val,
            }))
            }
        />
      ))}
      </div>
    </div>
  );
}

const AvailabilityRow : React.FC<AvailabilityRowProps> = ({ day, value, onChange}) => {
  
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}:${minute} ${suffix}`;
  };
  
  return (
    <div className="flex items-center gap-20 py-2">
        <div className="flex items-center gap-2">
        <input
        type="checkbox"
        id={day}
        checked={value.enabled}
        onChange={() => onChange({ ...value, enabled: !value.enabled })}
        className="w-4 h-4 accent-green-600"
        />
        <label htmlFor={day} className="w-24 font-medium">{day}</label>
        </div>
        {!value.enabled ? (
        <span className="text-gray-500">Unavailable</span>
      ) : (
        <div className="flex items-center gap-2">
        <select
          className="border rounded px-3 py-1"
          value={value.start}
          onChange={(e) => onChange({ ...value, start: e.target.value })}
        >
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {formatTime(time)}
            </option>
          ))}
        </select>

        <span>-</span>

        <select
          className="border rounded px-3 py-1"
          value={value.end}
          onChange={(e) => onChange({ ...value, end: e.target.value })}
        >
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {formatTime(time)}
            </option>
          ))}
        </select>
      </div>
      )}
    </div>
  );
}