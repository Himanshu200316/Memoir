"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User,
  Heart,
  Dumbbell,
  Sparkles,
  ChevronRight,
  Check,
  LayoutDashboard,
  Bot,
  ShieldCheck,
} from "lucide-react";
import { useLocalState } from "@/lib/useLocalState";
import { emptyProfile } from "@/lib/data";

const TOTAL_STEPS = 6;

// Step 1: Name
function StepName({
  name,
  onChange,
}: {
  name: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-memoir-primary-lighter/40 mx-auto mb-6 flex items-center justify-center">
        <User size={28} className="text-memoir-primary" />
      </div>
      <h2 className="text-2xl font-bold text-memoir-text mb-2">
        What should we call you?
      </h2>
      <p className="text-sm text-memoir-text-muted mb-8">
        This helps us personalise your experience
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your first name"
        className="w-full max-w-sm mx-auto block px-4 py-3 rounded-xl border border-memoir-border text-center text-lg focus:outline-none focus:border-memoir-primary focus:ring-2 focus:ring-memoir-primary/20"
        style={{ background: '#fff', color: '#2C2420' }}
        autoFocus
      />
    </div>
  );
}

// Step 2: Purpose
function StepPurpose({
  purpose,
  onChange,
}: {
  purpose: string;
  onChange: (v: string) => void;
}) {
  const options = [
    {
      value: "medical",
      icon: Heart,
      title: "Medical Tracking",
      description: "Medications, symptoms, conditions, doctor visits",
      color: "#C47A5A",
    },
    {
      value: "fitness",
      icon: Dumbbell,
      title: "Fitness & Wellness",
      description: "Workouts, nutrition, sleep, body metrics",
      color: "#7B9E7B",
    },
    {
      value: "both",
      icon: Sparkles,
      title: "Both",
      description: "Complete health operating system",
      color: "#6B8DAE",
    },
  ];

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-memoir-text mb-2">
        What brings you to Memoir?
      </h2>
      <p className="text-sm text-memoir-text-muted mb-8">
        We&apos;ll tailor your experience based on your goals
      </p>
      <div className="grid gap-4 max-w-md mx-auto">
        {options.map((opt) => (
          <motion.button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
            style={{
              borderColor:
                purpose === opt.value ? opt.color : "var(--memoir-border-light)",
              backgroundColor:
                purpose === opt.value ? opt.color + "08" : "var(--memoir-warm-white)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: opt.color + "18",
                color: opt.color,
              }}
            >
              <opt.icon size={22} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-memoir-text">
                {opt.title}
              </div>
              <div className="text-xs text-memoir-text-muted">
                {opt.description}
              </div>
            </div>
            {purpose === opt.value && (
              <Check size={18} style={{ color: opt.color }} />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Step 3: Basic Profile
function StepProfile({
  profile,
  onChange,
}: {
  profile: { age: string; sex: string; height: string; weight: string };
  onChange: (field: string, value: string) => void;
}) {
  const sexOptions = ["Male", "Female", "Other"];

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-memoir-text mb-2">
        Tell us about yourself
      </h2>
      <p className="text-sm text-memoir-text-muted mb-8">
        This helps our AI give better recommendations
      </p>
      <div className="max-w-md mx-auto space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-memoir-text-secondary mb-1.5 text-left">
              Age
            </label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => onChange("age", e.target.value)}
              placeholder="25"
              className="w-full px-4 py-2.5 rounded-xl border border-memoir-border text-sm focus:outline-none focus:border-memoir-primary focus:ring-2 focus:ring-memoir-primary/20"
              style={{ background: '#fff', color: '#2C2420' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-memoir-text-secondary mb-1.5 text-left">
              Sex
            </label>
            <div className="flex gap-2">
              {sexOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => onChange("sex", s.toLowerCase())}
                  className="flex-1 py-2.5 text-xs font-medium rounded-xl border transition-colors"
                  style={{
                    borderColor:
                      profile.sex === s.toLowerCase()
                        ? "var(--memoir-primary)"
                        : "var(--memoir-border)",
                    backgroundColor:
                      profile.sex === s.toLowerCase()
                        ? "var(--memoir-primary-lighter)"
                        : "white",
                    color:
                      profile.sex === s.toLowerCase()
                        ? "var(--memoir-primary-dark)"
                        : "var(--memoir-text-secondary)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-memoir-text-secondary mb-1.5 text-left">
              Height (cm)
            </label>
            <input
              type="number"
              value={profile.height}
              onChange={(e) => onChange("height", e.target.value)}
              placeholder="170"
              className="w-full px-4 py-2.5 rounded-xl border border-memoir-border text-sm focus:outline-none focus:border-memoir-primary focus:ring-2 focus:ring-memoir-primary/20"
              style={{ background: '#fff', color: '#2C2420' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-memoir-text-secondary mb-1.5 text-left">
              Weight (kg)
            </label>
            <input
              type="number"
              value={profile.weight}
              onChange={(e) => onChange("weight", e.target.value)}
              placeholder="70"
              className="w-full px-4 py-2.5 rounded-xl border border-memoir-border text-sm focus:outline-none focus:border-memoir-primary focus:ring-2 focus:ring-memoir-primary/20"
              style={{ background: '#fff', color: '#2C2420' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 4: Conditions / Goals
function StepConditions({
  purpose,
  conditions,
  onToggle,
}: {
  purpose: string;
  conditions: string[];
  onToggle: (c: string) => void;
}) {
  const medicalConditions = [
    "Diabetes", "Hypertension", "Asthma", "Thyroid", "Heart Disease",
    "Arthritis", "PCOS", "Migraine", "Anxiety", "Depression",
  ];

  const fitnessGoals = [
    "Lose Weight", "Build Muscle", "Improve Endurance", "Flexibility",
    "Better Sleep", "Stress Reduction", "Nutrition", "Marathon Training",
  ];

  const isMedical = purpose === "medical" || purpose === "both";
  const items = isMedical ? medicalConditions : fitnessGoals;
  const title = isMedical
    ? "Any conditions we should know about?"
    : "What are your fitness goals?";

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-memoir-text mb-2">{title}</h2>
      <p className="text-sm text-memoir-text-muted mb-8">
        Select all that apply — you can change these later
      </p>
      <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className="px-4 py-2 text-sm font-medium rounded-full transition-all"
            style={{
              backgroundColor: conditions.includes(item)
                ? "var(--memoir-primary)"
                : "var(--memoir-sand)",
              color: conditions.includes(item)
                ? "white"
                : "var(--memoir-text-secondary)",
            }}
          >
            {conditions.includes(item) && "✓ "}
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 5: Feature Walkthrough
function StepWalkthrough({ slide }: { slide: number }) {
  const slides = [
    {
      icon: LayoutDashboard,
      color: "#C47A5A",
      title: "Your Health Dashboard",
      description:
        "See all your vitals, medications, fitness, and mood at a glance. Everything in one calm, organised view.",
    },
    {
      icon: Bot,
      color: "#6B8DAE",
      title: "AI That Understands You",
      description:
        "Our AI learns your patterns, flags concerns early, and gives you personalised health insights every day.",
    },
    {
      icon: ShieldCheck,
      color: "#7B9E7B",
      title: "Private & Secure",
      description:
        "Your health data is encrypted end-to-end. We never sell your data. You control everything.",
    },
  ];

  const current = slides[slide % slides.length];
  const CurrentIcon = current.icon;

  return (
    <div className="text-center">
      <motion.div
        key={slide}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
      >
        <div
          className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: current.color + "18", color: current.color }}
        >
          <CurrentIcon size={38} />
        </div>
        <h2 className="text-2xl font-bold text-memoir-text mb-3">
          {current.title}
        </h2>
        <p className="text-sm text-memoir-text-secondary max-w-sm mx-auto leading-relaxed">
          {current.description}
        </p>
      </motion.div>
      <div className="flex justify-center gap-2 mt-8">
        {slides.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === slide % slides.length ? 24 : 8,
              backgroundColor:
                i === slide % slides.length
                  ? "var(--memoir-primary)"
                  : "var(--memoir-sand)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Step 6: Complete
function StepComplete({ name }: { name: string }) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full bg-memoir-secondary-light mx-auto mb-6 flex items-center justify-center"
      >
        <Check size={36} className="text-white" />
      </motion.div>
      <h2 className="text-2xl font-bold text-memoir-text mb-2">
        You&apos;re all set, {name || "friend"}! 🎉
      </h2>
      <p className="text-sm text-memoir-text-secondary max-w-sm mx-auto mb-4">
        Your personal health operating system is ready. Let&apos;s start your
        journey.
      </p>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [profile, setProfile] = useState({
    age: "",
    sex: "",
    height: "",
    weight: "",
  });
  const [conditions, setConditions] = useState<string[]>([]);
  const [walkthroughSlide, setWalkthroughSlide] = useState(0);
  const [savedProfile, setSavedProfile] = useLocalState("profile", emptyProfile);
  const [, setSavedConditions] = useLocalState<string[]>("conditions", []);

  // Pre-fill the name if it was already captured at sign-up.
  useEffect(() => {
    if (savedProfile.name && !name) setName(savedProfile.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedProfile.name]);

  const canProceed = () => {
    switch (step) {
      case 0: return name.trim().length > 0;
      case 1: return purpose !== "";
      case 2: return true; // optional
      case 3: return true; // optional
      case 4: return true;
      case 5: return true;
      default: return true;
    }
  };

  const next = () => {
    if (step === 4) {
      setWalkthroughSlide((prev) => prev + 1);
      if (walkthroughSlide >= 2) {
        setStep(5);
        return;
      }
      return;
    }
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      setSavedProfile((prev) => ({
        ...prev,
        name,
        age: profile.age,
        sex: profile.sex,
        height: profile.height,
        weight: profile.weight,
        purpose,
      }));
      setSavedConditions(conditions);
      router.push("/dashboard");
    }
  };

  const prev = () => {
    if (step === 4 && walkthroughSlide > 0) {
      setWalkthroughSlide(walkthroughSlide - 1);
      return;
    }
    if (step > 0) setStep(step - 1);
  };

  const toggleCondition = (c: string) => {
    setConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-memoir-cream flex flex-col">

      {/* Progress bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-memoir-sand"
        style={{ zIndex: 50 }}
      >
        <motion.div
          className="h-full bg-memoir-primary rounded-r-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Content */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-20 relative"
        style={{ zIndex: 1 }}
      >
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={step === 4 ? `walk-${walkthroughSlide}` : step}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.3 }}
            >
              {step === 0 && <StepName name={name} onChange={setName} />}
              {step === 1 && (
                <StepPurpose purpose={purpose} onChange={setPurpose} />
              )}
              {step === 2 && (
                <StepProfile
                  profile={profile}
                  onChange={(field, value) =>
                    setProfile((prev) => ({ ...prev, [field]: value }))
                  }
                />
              )}
              {step === 3 && (
                <StepConditions
                  purpose={purpose}
                  conditions={conditions}
                  onToggle={toggleCondition}
                />
              )}
              {step === 4 && <StepWalkthrough slide={walkthroughSlide} />}
              {step === 5 && <StepComplete name={name} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-between p-6 bg-memoir-cream/80 backdrop-blur-sm border-t border-memoir-border-light"
        style={{ zIndex: 50 }}
      >
        <button
          onClick={prev}
          disabled={step === 0}
          className="flex items-center gap-2 text-sm font-medium text-memoir-text-secondary disabled:opacity-30 disabled:cursor-not-allowed hover:text-memoir-text transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="text-xs text-memoir-text-muted">
          {step + 1} of {TOTAL_STEPS}
        </div>

        <button
          onClick={next}
          disabled={!canProceed()}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {step === TOTAL_STEPS - 1 ? "Go to Dashboard" : "Continue"}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
