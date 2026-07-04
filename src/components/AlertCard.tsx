"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface AlertCardProps {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function AlertCard({
  title,
  body,
  actionLabel,
  onAction,
}: AlertCardProps) {
  return (
    <motion.div
      className="rounded-xl p-4 border"
      style={{
        background: "linear-gradient(135deg, #C4707010, #C4707008)",
        borderColor: "#C4707030",
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{
            backgroundColor: "#C4707020",
            color: "var(--memoir-danger)",
          }}
        >
          <AlertTriangle size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-memoir-text mb-1">
            {title}
          </h4>
          <p className="text-xs text-memoir-text-secondary leading-relaxed">
            {body}
          </p>
          {actionLabel && (
            <button
              onClick={onAction}
              className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
              style={{
                color: "var(--memoir-danger)",
                backgroundColor: "#C4707015",
              }}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
