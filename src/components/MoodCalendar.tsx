"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MoodType } from "@/types";

const moodColors: Record<MoodType, string> = {
  great: "#7B9E7B",
  good: "#9ABD9A",
  okay: "#D4A96A",
  low: "#D4956F",
  bad: "#C47A5A",
  awful: "#C47070",
};

interface MoodCalendarProps {
  moods: Record<string, MoodType>; // { "2024-01-15": "good", ... }
  onDayClick?: (date: string) => void;
  compact?: boolean;
}

export default function MoodCalendar({
  moods,
  onDayClick,
  compact = false,
}: MoodCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const prevMonth = () =>
    setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () =>
    setCurrentDate(new Date(year, month + 1, 1));

  const formatDate = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  return (
    <div className={compact ? "" : "card p-4"}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1 rounded-lg hover:bg-memoir-sand/50 transition-colors"
        >
          <ChevronLeft size={16} className="text-memoir-text-muted" />
        </button>
        <span className="text-sm font-semibold text-memoir-text">
          {monthNames[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 rounded-lg hover:bg-memoir-sand/50 transition-colors"
        >
          <ChevronRight size={16} className="text-memoir-text-muted" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-memoir-text-muted py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = formatDate(day);
          const mood = moods[dateStr];

          return (
            <motion.button
              key={day}
              onClick={() => onDayClick?.(dateStr)}
              className="relative flex flex-col items-center justify-center rounded-lg py-1.5 transition-colors hover:bg-memoir-sand/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                border: isToday(day)
                  ? "1.5px solid var(--memoir-primary)"
                  : "1.5px solid transparent",
              }}
            >
              <span
                className={`text-xs ${
                  isToday(day) ? "font-bold text-memoir-primary" : "text-memoir-text"
                }`}
              >
                {day}
              </span>
              {mood && (
                <div
                  className="w-1.5 h-1.5 rounded-full mt-0.5"
                  style={{ backgroundColor: moodColors[mood] }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
