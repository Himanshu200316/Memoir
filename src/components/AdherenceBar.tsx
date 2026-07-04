"use client";

import { motion } from "framer-motion";

interface AdherenceBarProps {
  data: boolean[]; // 14 booleans for the last 14 days
  label?: string;
}

export default function AdherenceBar({ data, label }: AdherenceBarProps) {
  const total = data.length;
  const taken = data.filter(Boolean).length;
  const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-memoir-text">{label}</span>
          <span className="text-xs text-memoir-text-muted">
            {percentage}% adherence
          </span>
        </div>
      )}
      <div className="flex gap-1">
        {data.map((taken, index) => (
          <motion.div
            key={index}
            className="flex-1 h-6 rounded"
            style={{
              backgroundColor: taken
                ? "var(--memoir-secondary)"
                : "var(--memoir-sand)",
              originX: 0,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 0.3,
              delay: index * 0.04,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-memoir-text-muted">14 days ago</span>
        <span className="text-[10px] text-memoir-text-muted">Today</span>
      </div>
    </div>
  );
}
