"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import type { MetricCardData } from "@/types";
import {
  Heart,
  Pill,
  Activity,
  Moon,
  Flame,
  Footprints,
  Droplets,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  heart: Heart,
  pill: Pill,
  activity: Activity,
  moon: Moon,
  flame: Flame,
  footprints: Footprints,
  droplets: Droplets,
};

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 80, damping: 20 });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toLocaleString();
      }
    });
    return unsubscribe;
  }, [springValue]);

  return <span ref={ref}>0</span>;
}

export default function MetricCard({ data }: { data: MetricCardData }) {
  const Icon = iconMap[data.icon] || Activity;
  const TrendIcon =
    data.trend === "up" ? TrendingUp : data.trend === "down" ? TrendingDown : Minus;

  return (
    <motion.div
      className="card p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: data.color + "20", color: data.color }}
        >
          <Icon size={20} />
        </div>
        {data.trend && (
          <div
            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
            style={{
              color:
                data.trend === "up"
                  ? "var(--memoir-success)"
                  : data.trend === "down"
                  ? "var(--memoir-danger)"
                  : "var(--memoir-text-muted)",
              backgroundColor:
                data.trend === "up"
                  ? "var(--memoir-secondary-lighter)"
                  : data.trend === "down"
                  ? "#C4707020"
                  : "var(--memoir-sand)",
            }}
          >
            <TrendIcon size={12} />
            {data.trendValue}
          </div>
        )}
      </div>

      <div className="text-2xl font-bold text-memoir-text mb-0.5">
        <AnimatedNumber value={data.value} />
        {data.unit && (
          <span className="text-sm font-normal text-memoir-text-muted ml-1">
            {data.unit}
          </span>
        )}
      </div>

      <div className="text-xs text-memoir-text-muted">{data.label}</div>

      {data.subLabel && (
        <div className="text-xs text-memoir-text-secondary mt-1">
          {data.subLabel}
        </div>
      )}
    </motion.div>
  );
}
