"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { MoodType } from "@/types";

const moods: { type: MoodType; emoji: string; label: string; color: string }[] = [
  { type: "great", emoji: "😄", label: "Great", color: "#7B9E7B" },
  { type: "good", emoji: "🙂", label: "Good", color: "#9ABD9A" },
  { type: "okay", emoji: "😐", label: "Okay", color: "#D4A96A" },
  { type: "low", emoji: "😔", label: "Low", color: "#D4956F" },
  { type: "bad", emoji: "😢", label: "Bad", color: "#C47A5A" },
  { type: "awful", emoji: "😰", label: "Awful", color: "#C47070" },
];

const factors = [
  "Work", "Sleep", "Exercise", "Social", "Weather",
  "Food", "Stress", "Family", "Health", "Travel",
];

interface MoodPickerProps {
  isOpen: boolean;
  date: string;
  onClose: () => void;
  onSave: (mood: MoodType, selectedFactors: string[]) => void;
}

export default function MoodPicker({
  isOpen,
  date,
  onClose,
  onSave,
}: MoodPickerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);

  const toggleFactor = (factor: string) => {
    setSelectedFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((f) => f !== factor)
        : [...prev, factor]
    );
  };

  const handleSave = () => {
    if (selectedMood) {
      onSave(selectedMood, selectedFactors);
      setSelectedMood(null);
      setSelectedFactors([]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            style={{ zIndex: 50 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 51, pointerEvents: "none" }}
          >
          <motion.div
            className="w-full max-w-md p-6 bg-memoir-warm-white rounded-2xl shadow-xl"
            style={{ pointerEvents: "auto" }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-memoir-text">
                  How are you feeling?
                </h3>
                <p className="text-xs text-memoir-text-muted mt-0.5">{date}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-memoir-sand/50 transition-colors"
              >
                <X size={18} className="text-memoir-text-muted" />
              </button>
            </div>

            {/* Mood grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {moods.map((mood) => (
                <motion.button
                  key={mood.type}
                  onClick={() => setSelectedMood(mood.type)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors"
                  style={{
                    borderColor:
                      selectedMood === mood.type ? mood.color : "transparent",
                    backgroundColor:
                      selectedMood === mood.type
                        ? mood.color + "15"
                        : "var(--memoir-sand)",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs font-medium text-memoir-text">
                    {mood.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Contributing factors */}
            {selectedMood && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-5"
              >
                <p className="text-sm font-medium text-memoir-text mb-2">
                  What&apos;s contributing?
                </p>
                <div className="flex flex-wrap gap-2">
                  {factors.map((factor) => (
                    <button
                      key={factor}
                      onClick={() => toggleFactor(factor)}
                      className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
                      style={{
                        backgroundColor: selectedFactors.includes(factor)
                          ? "var(--memoir-primary)"
                          : "var(--memoir-sand)",
                        color: selectedFactors.includes(factor)
                          ? "white"
                          : "var(--memoir-text-secondary)",
                      }}
                    >
                      {factor}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={!selectedMood}
              className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Mood
            </button>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
