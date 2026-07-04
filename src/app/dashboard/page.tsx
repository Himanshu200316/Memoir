"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon as MoonIcon,
  CloudSun,
  Sparkles,
  Pill,
  Check,
  Clock,
  Calendar,
  Dumbbell,
  Utensils,
  BedDouble,
  Activity,
  Plus,
  Loader2,
  X,
  UserRound,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import AdherenceBar from "@/components/AdherenceBar";
import MoodCalendar from "@/components/MoodCalendar";
import MoodPicker from "@/components/MoodPicker";
import DashboardWaveBackground from "@/components/DashboardWaveBackground";
import ProductTour, { type TourStep } from "@/components/ProductTour";
import { useLocalState } from "@/lib/useLocalState";
import { getActiveUserId } from "@/lib/storage";
import {
  todayKey,
  lastNDaysBool,
  isTakenToday,
  emptyProfile,
  type Profile,
  type StoredMedication,
  type Appointment,
  type Doctor,
  type MoodType,
  type TrackedSymptom,
  type Workout,
  type NutritionLog,
  type SleepLog,
} from "@/lib/data";
import type { MetricCardData } from "@/types";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: Sun, color: "#D4A96A" };
  if (hour < 17) return { text: "Good afternoon", icon: CloudSun, color: "#C47A5A" };
  return { text: "Good evening", icon: MoonIcon, color: "#6B8DAE" };
}

const TOUR_STEPS: TourStep[] = [
  { selector: '[data-tour="nav-dashboard"]', title: "Your Dashboard", body: "Medications, appointments, and mood at a glance — this is home base." },
  { selector: '[data-tour="nav-symptoms"]', title: "Symptoms", body: "Log how you're feeling with a quick severity slider, and watch trends build over time." },
  { selector: '[data-tour="nav-diary"]', title: "Dear Diary", body: "Pick a mood, write a few lines, and build a daily streak." },
  { selector: '[data-tour="nav-medical"]', title: "Medical", body: "Manage medications, view adherence charts, and keep your doctors on file." },
  { selector: '[data-tour="nav-health"]', title: "Health & Fitness", body: "Log workouts, sleep, water, and steps — weekly goals fill in as you go." },
  { selector: '[data-tour="nav-chat"]', title: "AI Chat", body: "Ask questions about your own health data — it only knows what you've actually logged." },
  { selector: '[data-tour="nav-documents"]', title: "Documents", body: "Drop in lab reports or prescriptions to keep everything in one place." },
  { selector: '[data-tour="log-mood"]', title: "Log your mood", body: "One tap logs today's mood and feeds your monthly mood calendar." },
  { selector: '[data-tour="medications-card"]', title: "Today's Medications", body: "Add a medication here, then mark it taken with a single tap." },
  { selector: '[data-tour="ai-insight"]', title: "AI Insight", body: "Once you've logged a bit of data, get a short, personalised insight on demand." },
  { selector: '[data-tour="nav-theme"]', title: "Light or dark", body: "Switch themes anytime — your preference is remembered." },
  { selector: '[data-tour="nav-profile"]', title: "Profile & Settings", body: "Update your details, manage notifications, or export your data." },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"medical" | "fitness">("medical");
  const [moodPickerOpen, setMoodPickerOpen] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [apptForm, setApptForm] = useState({ doctorName: "", specialty: "", date: "", time: "" });
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [tourSeen, setTourSeen] = useLocalState<boolean>("tourSeen", false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error" | "not_configured">("idle");

  const [profile] = useLocalState<Profile>("profile", emptyProfile);
  const [medications, setMedications] = useLocalState<StoredMedication[]>("medications", []);
  const [appointments, setAppointments] = useLocalState<Appointment[]>("appointments", []);
  const [doctors] = useLocalState<Doctor[]>("doctors", []);
  const [moods, setMoods] = useLocalState<Record<string, MoodType>>("moods", {});
  const [trackedSymptoms] = useLocalState<TrackedSymptom[]>("symptoms", []);
  const [workouts] = useLocalState<Workout[]>("workouts", []);
  const [nutritionLogs] = useLocalState<Record<string, NutritionLog>>("nutritionLogs", {});
  const [sleepLogs] = useLocalState<Record<string, SleepLog>>("sleepLogs", {});
  const [waterLog] = useLocalState<Record<string, number>>("water", {});
  const [stepLogs] = useLocalState<Record<string, number>>("steps", {});

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  const today = todayKey();

  const takenCount = medications.filter(isTakenToday).length;
  const avgSymptomSeverity =
    trackedSymptoms.length > 0
      ? Math.round(
          (trackedSymptoms.reduce((s, x) => s + x.severity, 0) / trackedSymptoms.length) * 10
        ) / 10
      : null;

  const todaysWorkout = workouts.find((w) => w.date === today) || null;
  const todaysNutrition = nutritionLogs[today] || null;
  const todaysSleep = sleepLogs[today] || null;
  const todaysWater = waterLog[today] || 0;
  const todaysSteps = stepLogs[today] || 0;
  const todaysCalories = workouts
    .filter((w) => w.date === today)
    .reduce((s, w) => s + w.calories, 0);

  const medicalMetrics: MetricCardData[] = [
    {
      label: "Medications Due Today",
      value: medications.length,
      subLabel: medications.length ? `${takenCount} taken, ${medications.length - takenCount} remaining` : "No medications added",
      color: "#6B8DAE",
      icon: "pill",
    },
    {
      label: "Symptom Score",
      value: avgSymptomSeverity ?? 0,
      unit: avgSymptomSeverity !== null ? "/10" : "",
      subLabel: avgSymptomSeverity !== null ? "Average of tracked symptoms" : "No symptoms tracked",
      color: "#7B9E7B",
      icon: "activity",
    },
    {
      label: "Upcoming Appointments",
      value: appointments.length,
      subLabel: appointments.length ? "Scheduled" : "None scheduled",
      color: "#C47A5A",
      icon: "heart",
    },
    {
      label: "Doctors on File",
      value: doctors.length,
      subLabel: doctors.length ? "Saved contacts" : "None added yet",
      color: "#D4A96A",
      icon: "heart",
    },
  ];

  const fitnessMetrics: MetricCardData[] = [
    {
      label: "Calories Burned",
      value: todaysCalories,
      unit: "kcal",
      subLabel: todaysCalories ? "From today's workouts" : "No workouts logged today",
      color: "#C47A5A",
      icon: "flame",
    },
    {
      label: "Steps Today",
      value: todaysSteps,
      subLabel: todaysSteps ? "Logged" : "Log steps on Health page",
      color: "#7B9E7B",
      icon: "footprints",
    },
    {
      label: "Sleep Quality",
      value: todaysSleep?.quality ?? 0,
      unit: todaysSleep ? "%" : "",
      subLabel: todaysSleep ? `${todaysSleep.totalHours}h logged` : "No sleep logged",
      color: "#6B8DAE",
      icon: "moon",
    },
    {
      label: "Water Intake",
      value: todaysWater,
      unit: "glasses",
      subLabel: "Goal: 8 glasses",
      color: "#D4A96A",
      icon: "droplets",
    },
  ];

  const metrics = activeTab === "medical" ? medicalMetrics : fitnessMetrics;

  const handleMoodSave = (mood: MoodType) => {
    setMoods((prev) => ({ ...prev, [today]: mood }));
  };

  const toggleMedTaken = (id: string) => {
    setMedications((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, takenLog: { ...m.takenLog, [today]: !isTakenToday(m) } } : m
      )
    );
  };

  const addAppointment = async () => {
    if (!apptForm.doctorName.trim() || !apptForm.date) return;
    const newAppt = { id: Date.now().toString(), ...apptForm };
    setAppointments((prev) => [...prev, newAppt]);
    setApptForm({ doctorName: "", specialty: "", date: "", time: "" });
    setShowAddAppointment(false);

    if (!profile.email) return;

    setEmailStatus("sending");
    try {
      const res = await fetch("/api/notify-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: profile.email,
          recipientName: profile.name,
          doctorName: newAppt.doctorName,
          specialty: newAppt.specialty,
          date: newAppt.date,
          time: newAppt.time,
        }),
      });
      const data = await res.json();
      if (data.sent) {
        setEmailStatus("sent");
      } else if (typeof data.message === "string" && data.message.includes("not configured")) {
        setEmailStatus("not_configured");
      } else {
        setEmailStatus("error");
      }
    } catch {
      setEmailStatus("error");
    } finally {
      setTimeout(() => setEmailStatus("idle"), 4000);
    }
  };

  const removeAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const hasAnyData =
    medications.length > 0 ||
    Object.keys(moods).length > 0 ||
    trackedSymptoms.length > 0 ||
    workouts.length > 0 ||
    Object.keys(sleepLogs).length > 0;

  const generateInsight = async () => {
    setInsightLoading(true);
    setInsight("");
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          healthData: {
            medications: medications.map((m) => ({ name: m.name, takenToday: isTakenToday(m) })),
            symptoms: trackedSymptoms,
            recentMood: moods[today] || null,
            todaysWorkout,
            todaysNutrition,
            todaysSleep,
            todaysWater,
            todaysSteps,
          },
          userId: getActiveUserId(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInsight(data.error === "quota_exceeded" ? data.message : "Couldn't generate an insight right now.");
      } else {
        setInsight(data.insight || "Couldn't generate an insight right now.");
      }
    } catch {
      setInsight("Couldn't generate an insight right now.");
    } finally {
      setInsightLoading(false);
    }
  };

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative">
      <DashboardWaveBackground />
      {!tourSeen && (
        <ProductTour steps={TOUR_STEPS} onFinish={() => setTourSeen(true)} />
      )}
      <div className="relative" style={{ zIndex: 1 }}>
      <MoodPicker
        isOpen={moodPickerOpen}
        date={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        onClose={() => setMoodPickerOpen(false)}
        onSave={(mood) => { handleMoodSave(mood); setMoodPickerOpen(false); }}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <GreetingIcon size={20} style={{ color: greeting.color }} />
            <h1 className="text-2xl font-bold text-memoir-text">
              {greeting.text}
            </h1>
          </div>
          <button
            onClick={() => setMoodPickerOpen(true)}
            data-tour="log-mood"
            className="btn-secondary text-sm"
          >
            😊 Log Mood
          </button>
        </div>
        <p className="text-sm text-memoir-text-muted">{dateLabel}</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-memoir-sand/50 w-fit mb-6">
        {(["medical", "fitness"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative px-5 py-2 text-sm font-medium rounded-full transition-colors"
            style={{
              color:
                activeTab === tab
                  ? "var(--memoir-text)"
                  : "var(--memoir-text-muted)",
            }}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 bg-memoir-warm-white rounded-full shadow-sm"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              {tab === "medical" ? "🩺 Medical" : "💪 Fitness & Wellness"}
            </span>
          </button>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} data={metric} />
        ))}
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeTab === "medical" ? (
          <motion.div
            key="medical"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Medications Card */}
              <div className="card p-5" data-tour="medications-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-memoir-text flex items-center gap-2">
                    <Pill size={18} className="text-memoir-blue" />
                    Today&apos;s Medications
                  </h3>
                  {medications.length > 0 && (
                    <span className="text-xs text-memoir-text-muted">
                      {takenCount} of {medications.length} taken
                    </span>
                  )}
                </div>

                {medications.length === 0 ? (
                  <div className="text-center py-10">
                    <Pill size={36} className="text-memoir-sand-dark mx-auto mb-3" />
                    <p className="text-sm text-memoir-text-muted mb-3">
                      No medications added yet.
                    </p>
                    <a href="/medical" className="btn-secondary text-xs no-underline">
                      Add a medication
                    </a>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {medications.map((med) => {
                        const taken = isTakenToday(med);
                        return (
                          <div
                            key={med.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-memoir-cream/50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{
                                  backgroundColor: taken
                                    ? "var(--memoir-secondary-lighter)"
                                    : "var(--memoir-sand)",
                                }}
                              >
                                {taken ? (
                                  <Check size={14} className="text-memoir-secondary-dark" />
                                ) : (
                                  <Clock size={14} className="text-memoir-text-muted" />
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-memoir-text">
                                  {med.name}
                                </div>
                                <div className="text-xs text-memoir-text-muted">
                                  {med.time}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleMedTaken(med.id)}
                              className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                              style={{
                                backgroundColor: taken
                                  ? "var(--memoir-secondary-lighter)"
                                  : "var(--memoir-primary-lighter)",
                                color: taken
                                  ? "var(--memoir-secondary-dark)"
                                  : "var(--memoir-primary-dark)",
                              }}
                            >
                              {taken ? "✓ Taken" : "Mark Taken"}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-memoir-border-light">
                      <AdherenceBar
                        data={lastNDaysBool(medications[0].takenLog)}
                        label="Overall Adherence (14 days)"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Appointments */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-memoir-text flex items-center gap-2">
                    <Calendar size={18} className="text-memoir-accent" />
                    Upcoming Appointments
                  </h3>
                  <button
                    onClick={() => setShowAddAppointment(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-memoir-primary hover:text-memoir-primary-dark transition-colors"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
                {emailStatus !== "idle" && (
                  <div
                    className="text-xs mb-3 px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor:
                        emailStatus === "sent" ? "var(--memoir-secondary-lighter)" : "var(--memoir-sand)",
                      color:
                        emailStatus === "sent" ? "var(--memoir-secondary-dark)" : "var(--memoir-text-muted)",
                    }}
                  >
                    {emailStatus === "sending" && "Sending confirmation email…"}
                    {emailStatus === "sent" && `✓ Confirmation email sent to ${profile.email}`}
                    {emailStatus === "not_configured" && "Appointment saved (email confirmations aren't set up yet)"}
                    {emailStatus === "error" && "Appointment saved, but the confirmation email couldn't be sent"}
                  </div>
                )}
                {appointments.length === 0 ? (
                  <p className="text-sm text-memoir-text-muted text-center py-6">
                    No appointments scheduled.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="flex items-center gap-4 p-3 rounded-xl bg-memoir-cream/50">
                        <div className="w-12 h-14 rounded-lg flex flex-col items-center justify-center text-white bg-memoir-primary">
                          <span className="text-[10px] font-medium uppercase">
                            {apt.date ? new Date(apt.date).toLocaleDateString("en-US", { month: "short" }) : "--"}
                          </span>
                          <span className="text-lg font-bold leading-none">
                            {apt.date ? new Date(apt.date).getDate() : "--"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-memoir-text">{apt.doctorName}</div>
                          <div className="text-xs text-memoir-text-muted">{apt.specialty} • {apt.time}</div>
                        </div>
                        <button onClick={() => removeAppointment(apt.id)} className="p-1.5 rounded-lg hover:bg-memoir-sand transition-colors">
                          <X size={14} className="text-memoir-text-muted" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-memoir-text mb-3">Mood This Month</h3>
                <MoodCalendar moods={moods} compact />
              </div>

              <div className="card p-4" data-tour="ai-insight">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-memoir-blue" />
                  <h3 className="text-sm font-semibold text-memoir-text">AI Insight</h3>
                </div>
                {insight ? (
                  <p className="text-xs text-memoir-text-secondary leading-relaxed text-serif italic">
                    &quot;{insight}&quot;
                  </p>
                ) : (
                  <p className="text-xs text-memoir-text-muted mb-3">
                    {hasAnyData
                      ? "Get a personalised insight based on your logged data."
                      : "Log some medications, symptoms, or mood to unlock AI insights."}
                  </p>
                )}
                <button
                  onClick={generateInsight}
                  disabled={!hasAnyData || insightLoading}
                  className="btn-secondary text-xs mt-2 disabled:opacity-50"
                >
                  {insightLoading ? <><Loader2 size={12} className="animate-spin" /> Thinking...</> : "Get AI Insight"}
                </button>
              </div>

              <div className="card p-4">
                <h3 className="text-sm font-semibold text-memoir-text mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Log Symptom", icon: Activity, href: "/symptoms" },
                    { label: "Write Diary", icon: Plus, href: "/diary" },
                    { label: "AI Chat", icon: Sparkles, href: "/chat" },
                    { label: "Upload Doc", icon: Plus, href: "/documents" },
                  ].map((action) => (
                    <a
                      key={action.label}
                      href={action.href}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-memoir-cream/50 hover:bg-memoir-sand/40 transition-colors no-underline"
                    >
                      <action.icon size={16} className="text-memoir-primary" />
                      <span className="text-[11px] font-medium text-memoir-text-secondary">{action.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="fitness"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Workout */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-memoir-text flex items-center gap-2">
                    <Dumbbell size={18} className="text-memoir-secondary" />
                    Today&apos;s Workout
                  </h3>
                  {todaysWorkout && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-memoir-secondary-lighter text-memoir-secondary-dark">
                      {todaysWorkout.name}
                    </span>
                  )}
                </div>
                {!todaysWorkout ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-memoir-text-muted mb-3">No workout logged for today.</p>
                    <a href="/health" className="btn-secondary text-xs no-underline">Log a workout</a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todaysWorkout.exercises.map((ex) => (
                      <div key={ex.name} className="flex items-center justify-between p-3 rounded-xl bg-memoir-cream/50">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                            style={{
                              borderColor: ex.done ? "var(--memoir-secondary)" : "var(--memoir-sand-dark)",
                              backgroundColor: ex.done ? "var(--memoir-secondary)" : "transparent",
                            }}
                          >
                            {ex.done && <Check size={12} className="text-white" />}
                          </div>
                          <span
                            className="text-sm font-medium"
                            style={{
                              color: ex.done ? "var(--memoir-text-muted)" : "var(--memoir-text)",
                              textDecoration: ex.done ? "line-through" : "none",
                            }}
                          >
                            {ex.name}
                          </span>
                        </div>
                        <span className="text-xs text-memoir-text-muted">{ex.detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nutrition */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-memoir-text flex items-center gap-2">
                    <Utensils size={18} className="text-memoir-accent" />
                    Nutrition
                  </h3>
                  {todaysNutrition && (
                    <span className="text-xs text-memoir-text-muted">{todaysNutrition.calories} kcal</span>
                  )}
                </div>
                {!todaysNutrition ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-memoir-text-muted mb-3">No nutrition logged today.</p>
                    <a href="/health" className="btn-secondary text-xs no-underline">Log nutrition</a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { name: "Protein", current: todaysNutrition.protein, color: "#C47A5A" },
                      { name: "Carbs", current: todaysNutrition.carbs, color: "#D4A96A" },
                      { name: "Fat", current: todaysNutrition.fat, color: "#7B9E7B" },
                    ].map((macro) => (
                      <div key={macro.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-memoir-text">{macro.name}</span>
                          <span className="text-xs text-memoir-text-muted">{macro.current}g</span>
                        </div>
                        <div className="h-2 rounded-full bg-memoir-sand overflow-hidden">
                          <div className="h-full rounded-full" style={{ backgroundColor: macro.color, width: "100%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sleep */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-memoir-text flex items-center gap-2">
                    <BedDouble size={18} className="text-memoir-blue" />
                    Last Night&apos;s Sleep
                  </h3>
                  {todaysSleep && (
                    <span className="text-xs font-medium text-memoir-text-muted">{todaysSleep.totalHours}h</span>
                  )}
                </div>
                {!todaysSleep ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-memoir-text-muted mb-3">No sleep logged today.</p>
                    <a href="/health" className="btn-secondary text-xs no-underline">Log sleep</a>
                  </div>
                ) : (
                  <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                    {[
                      { stage: "Deep", value: todaysSleep.deepMin, color: "#4A6FA5" },
                      { stage: "Light", value: todaysSleep.lightMin, color: "#8FB0D0" },
                      { stage: "REM", value: todaysSleep.remMin, color: "#BDD4E8" },
                      { stage: "Awake", value: todaysSleep.awakeMin, color: "#E8DDD0" },
                    ].map((s) => {
                      const total = todaysSleep.deepMin + todaysSleep.lightMin + todaysSleep.remMin + todaysSleep.awakeMin || 1;
                      return (
                        <div key={s.stage} className="h-full" style={{ backgroundColor: s.color, width: `${(s.value / total) * 100}%` }} />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-memoir-text mb-3">Mood This Month</h3>
                <MoodCalendar moods={moods} compact />
              </div>

              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-memoir-secondary" />
                  <h3 className="text-sm font-semibold text-memoir-text">AI Insight</h3>
                </div>
                {insight ? (
                  <p className="text-xs text-memoir-text-secondary leading-relaxed text-serif italic">
                    &quot;{insight}&quot;
                  </p>
                ) : (
                  <p className="text-xs text-memoir-text-muted mb-3">
                    {hasAnyData
                      ? "Get a personalised insight based on your logged data."
                      : "Log a workout, sleep, or mood to unlock AI insights."}
                  </p>
                )}
                <button
                  onClick={generateInsight}
                  disabled={!hasAnyData || insightLoading}
                  className="btn-secondary text-xs mt-2 disabled:opacity-50"
                >
                  {insightLoading ? <><Loader2 size={12} className="animate-spin" /> Thinking...</> : "Get AI Insight"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add appointment modal */}
      <AnimatePresence>
        {showAddAppointment && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm"
              style={{ zIndex: 50 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddAppointment(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 51, pointerEvents: "none" }}>
            <motion.div
              className="w-full max-w-md p-6 bg-memoir-warm-white rounded-2xl shadow-xl"
              style={{ pointerEvents: "auto" }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-memoir-text flex items-center gap-2">
                  <UserRound size={18} /> Add Appointment
                </h3>
                <button onClick={() => setShowAddAppointment(false)}>
                  <X size={16} className="text-memoir-text-muted" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Doctor name"
                  value={apptForm.doctorName}
                  onChange={(e) => setApptForm((p) => ({ ...p, doctorName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary"
                />
                <input
                  type="text"
                  placeholder="Specialty"
                  value={apptForm.specialty}
                  onChange={(e) => setApptForm((p) => ({ ...p, specialty: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary"
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={apptForm.date}
                    onChange={(e) => setApptForm((p) => ({ ...p, date: e.target.value }))}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary"
                  />
                  <input
                    type="time"
                    value={apptForm.time}
                    onChange={(e) => setApptForm((p) => ({ ...p, time: e.target.value }))}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary"
                  />
                </div>
                <button onClick={addAppointment} className="btn-primary w-full">
                  Add Appointment
                </button>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
