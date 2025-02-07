"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateEventModal } from "./CreateEventModal";

interface Event {
  id: string;
  title: string;
  date: Date;
  color: string;
}

const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Technology Workshop",
    date: new Date(2025, 0, 1),
    color: "bg-blue-500/20 text-blue-500",
  },
  {
    id: "2",
    title: "Monthly Tech Meetup",
    date: new Date(2025, 0, 1),
    color: "bg-red-500/20 text-red-500",
  },
  {
    id: "3",
    title: "Giveaway by Guild",
    date: new Date(2025, 0, 13),
    color: "bg-green-500/20 text-green-500",
  },
  {
    id: "4",
    title: "Weekly Update Call",
    date: new Date(2025, 0, 17),
    color: "bg-purple-500/20 text-purple-500",
  },
  {
    id: "5",
    title: "Design with Guild",
    date: new Date(2025, 0, 26),
    color: "bg-pink-500/20 text-pink-500",
  },
  {
    id: "6",
    title: "Cyber Tech Workshop",
    date: new Date(2025, 1, 3),
    color: "bg-cyan-500/20 text-cyan-500",
  },
];

export function EventCalendar() {
  const [currentDate, setCurrentDate] = React.useState(new Date(2025, 0, 15));
  const [events] = React.useState<Event[]>(sampleEvents);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const handleCreateEvent = (eventData: any) => {
    console.log("New Event Created:", eventData);
    // Here you would typically add the event to your events state
    // and possibly make an API call to save it
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add days from previous month to fill the first row
    const startDay = firstDay.getDay(); // Get the first day of the month (0 = Sunday)
    const prevMonthLastDay = new Date(year, month, 0).getDate(); // Last day of the previous month
    for (let i = startDay; i > 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i + 1),
        isCurrentMonth: false,
      });
    }

    // Add days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-zinc-200 p-4 py-24">
      <div className="flex items-center justify-between mb-4 bg-zinc-900 p-4 rounded-lg">
        <div className="flex items-center gap-4 ">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() - 1))
                )
              }
              className="hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() + 1))
                )
              }
              className="hover:bg-zinc-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Select defaultValue="calendar">
            <SelectTrigger className="w-32 border-zinc-700 bg-transparent">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">Calendar</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus /> Create Event
        </Button>
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateEvent}
        />
      </div>

      <div className="flex-1 grid grid-cols-[auto_1fr] border border-zinc-700 rounded-lg overflow-hidden">
        <div className="w-12 bg-zinc-900 border-r border-zinc-700">
          <div className="h-10" /> {/* Header spacer */}
          {Array.from({ length: 6 }).map((_, weekIndex) => (
            <div
              key={weekIndex}
              className="h-24 flex items-center justify-center text-xs text-zinc-500 border-b border-zinc-700 last:border-b-0"
            >
              {getWeekNumber(days[weekIndex * 7].date)}
            </div>
          ))}
        </div>

        <div className="grid grid-rows-[auto_1fr] bg-zinc-900">
          <div className="grid grid-cols-7 text-xs text-zinc-500">
            {weekDays.map((day) => (
              <div
                key={day}
                className="h-10 flex items-center justify-center border-b border-zinc-700"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map(({ date, isCurrentMonth }, index) => (
              <div
                key={index}
                className={`h-24 p-1 border-r border-b border-zinc-700 last:border-r-0 ${
                  !isCurrentMonth ? "text-zinc-700" : ""
                }`}
              >
                <div className="text-xs mb-1">{date.getDate()}</div>
                <div className="space-y-1">
                  {events
                    .filter(
                      (event) =>
                        event.date.toDateString() === date.toDateString()
                    )
                    .map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded truncate ${event.color}`}
                      >
                        {event.title}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
