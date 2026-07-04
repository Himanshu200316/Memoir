"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface TourStep {
  selector: string;
  title: string;
  body: string;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function measureStep(selector: string): Rect | null {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null; // hidden (e.g. collapsed mobile sidebar)
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export default function ProductTour({
  steps,
  onFinish,
}: {
  steps: TourStep[];
  onFinish: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [ended, setEnded] = useState(false);

  useEffect(() => setMounted(true), []);

  const measure = useCallback(() => {
    let i = index;
    let r = measureStep(steps[i].selector);
    // skip forward past any step whose target isn't currently visible
    while (!r && i < steps.length - 1) {
      i += 1;
      r = measureStep(steps[i].selector);
    }
    if (!r) {
      setEnded(true);
      return;
    }
    if (i !== index) setIndex(i);
    setRect(r);
  }, [index, steps]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure]);

  if (!mounted || ended || !rect) return null;

  const step = steps[index];
  const isLast = index === steps.length - 1;

  const PADDING = 8;
  const TOOLTIP_WIDTH = 300;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const highlightStyle = {
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
  };

  const spaceRight = viewportW - (rect.left + rect.width);
  const spaceBelow = viewportH - (rect.top + rect.height);

  let tooltipStyle: { top: number; left: number };
  if (spaceRight > TOOLTIP_WIDTH + 40) {
    tooltipStyle = {
      top: Math.min(Math.max(rect.top, 16), viewportH - 240),
      left: rect.left + rect.width + PADDING + 16,
    };
  } else if (spaceBelow > 220) {
    tooltipStyle = {
      top: rect.top + rect.height + PADDING + 16,
      left: Math.min(Math.max(rect.left, 16), viewportW - TOOLTIP_WIDTH - 16),
    };
  } else {
    tooltipStyle = {
      top: Math.max(rect.top - 230, 16),
      left: Math.min(Math.max(rect.left, 16), viewportW - TOOLTIP_WIDTH - 16),
    };
  }

  return createPortal(
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 200 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`spot-${index}`}
          className="absolute rounded-xl"
          style={{
            top: highlightStyle.top,
            left: highlightStyle.left,
            width: highlightStyle.width,
            height: highlightStyle.height,
            boxShadow: "0 0 0 9999px rgba(20,16,13,0.55)",
            border: "2px solid var(--memoir-primary)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={`tip-${index}`}
          className="absolute w-[300px] p-5 rounded-2xl bg-memoir-warm-white pointer-events-auto"
          style={{ top: tooltipStyle.top, left: tooltipStyle.left, zIndex: 201, boxShadow: "var(--shadow-xl, 0 16px 48px rgba(0,0,0,0.2))" }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-memoir-primary">
              Step {index + 1} of {steps.length}
            </span>
            <button
              onClick={onFinish}
              className="text-memoir-text-muted hover:text-memoir-text transition-colors"
              aria-label="Close tour"
            >
              <X size={16} />
            </button>
          </div>
          <h3 className="text-sm font-semibold text-memoir-text mb-1">{step.title}</h3>
          <p className="text-xs text-memoir-text-secondary leading-relaxed mb-4">{step.body}</p>

          <div className="flex items-center justify-between">
            <button
              onClick={onFinish}
              className="text-xs text-memoir-text-muted hover:text-memoir-text-secondary transition-colors"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {index > 0 && (
                <button
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => (isLast ? onFinish() : setIndex((i) => i + 1))}
                className="btn-primary text-xs px-3 py-1.5"
              >
                {isLast ? "Done" : "Next"}
              </button>
            </div>
          </div>

          <div className="flex gap-1 mt-3">
            {steps.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{ background: i <= index ? "var(--memoir-primary)" : "var(--memoir-sand)" }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
