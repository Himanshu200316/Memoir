"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

interface SymptomSliderProps {
  name: string;
  value: number;
  onChange: (value: number) => void;
}

function getSeverityInfo(value: number) {
  if (value <= 3) return { label: "Mild", color: "#7B9E7B" };
  if (value <= 6) return { label: "Moderate", color: "#D4A96A" };
  return { label: "Severe", color: "#C47070" };
}

export default function SymptomSlider({
  name,
  value,
  onChange,
}: SymptomSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { label, color } = getSeverityInfo(value);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  const percentage = ((value - 1) / 9) * 100;

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-memoir-text">{name}</span>
        <motion.span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            color: color,
            backgroundColor: color + "18",
          }}
          animate={{ scale: isDragging ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {value}/10 — {label}
        </motion.span>
      </div>

      <div className="relative">
        <div className="h-2 rounded-full bg-memoir-sand overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>

        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: "8px", margin: 0 }}
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-memoir-text-muted">Mild</span>
        <span className="text-[10px] text-memoir-text-muted">Severe</span>
      </div>
    </div>
  );
}
