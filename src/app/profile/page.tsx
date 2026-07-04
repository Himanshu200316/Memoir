"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Save,
  Bell,
  Shield,
  LogOut,
  Check,
  Heart,
  Dumbbell,
} from "lucide-react";
import { useLocalState } from "@/lib/useLocalState";
import { emptyProfile, type Profile } from "@/lib/data";
import { exportAllState, clearActiveUserState, clearActiveUserId, removeAccountByEmail } from "@/lib/storage";

const defaultNotifications = {
  medications: true,
  insights: true,
  workouts: false,
  diary: true,
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useLocalState<Profile>("profile", emptyProfile);
  const { name, email, age, sex, height, weight, purpose } = profile;
  const setField = (field: keyof Profile, value: string) =>
    setProfile((prev) => ({ ...prev, [field]: value }));
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useLocalState("notifications", defaultNotifications);
  const [, setTourSeen] = useLocalState<boolean>("tourSeen", false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportData = () => {
    const data = exportAllState();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memoir-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (!window.confirm("This will permanently delete all your Memoir data from this browser. This cannot be undone. Continue?")) {
      return;
    }
    clearActiveUserState();
    if (email) removeAccountByEmail(email);
    clearActiveUserId();
    router.push("/auth");
  };

  const handleSignOut = () => {
    clearActiveUserId();
    router.push("/auth");
  };

  const handleRetakeTour = () => {
    setTourSeen(false);
    router.push("/dashboard");
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-memoir-text flex items-center gap-2">
          <User size={24} className="text-memoir-primary" />
          Profile &amp; Settings
        </h1>
        <p className="text-sm text-memoir-text-muted mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Avatar & Name */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-memoir-primary-lighter flex items-center justify-center">
            <span className="text-2xl font-bold text-memoir-primary">
              {name ? name.charAt(0).toUpperCase() : <User size={24} />}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-memoir-text">{name || "Your name"}</h2>
            <p className="text-sm text-memoir-text-muted">{email || "Add your email"}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-memoir-text-secondary mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2.5 rounded-xl border border-memoir-border bg-white text-sm text-memoir-text focus:outline-none focus:border-memoir-primary focus:ring-2 focus:ring-memoir-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-memoir-text-secondary mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-memoir-border bg-white text-sm text-memoir-text focus:outline-none focus:border-memoir-primary focus:ring-2 focus:ring-memoir-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-memoir-text-secondary mb-1.5">
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setField("age", e.target.value)}
              placeholder="Your age"
              className="w-full px-4 py-2.5 rounded-xl border border-memoir-border bg-white text-sm text-memoir-text focus:outline-none focus:border-memoir-primary focus:ring-2 focus:ring-memoir-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-memoir-text-secondary mb-1.5">
              Sex
            </label>
            <div className="flex gap-2">
              {["Male", "Female", "Other"].map((s) => (
                <button
                  key={s}
                  onClick={() => setField("sex", s.toLowerCase())}
                  className="flex-1 py-2.5 text-xs font-medium rounded-xl border transition-colors"
                  style={{
                    borderColor:
                      sex === s.toLowerCase()
                        ? "var(--memoir-primary)"
                        : "var(--memoir-border)",
                    backgroundColor:
                      sex === s.toLowerCase()
                        ? "var(--memoir-primary-lighter)"
                        : "white",
                    color:
                      sex === s.toLowerCase()
                        ? "var(--memoir-primary-dark)"
                        : "var(--memoir-text-secondary)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-memoir-text-secondary mb-1.5">
              Height (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setField("height", e.target.value)}
              placeholder="170"
              className="w-full px-4 py-2.5 rounded-xl border border-memoir-border bg-white text-sm text-memoir-text focus:outline-none focus:border-memoir-primary focus:ring-2 focus:ring-memoir-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-memoir-text-secondary mb-1.5">
              Weight (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setField("weight", e.target.value)}
              placeholder="70"
              className="w-full px-4 py-2.5 rounded-xl border border-memoir-border bg-white text-sm text-memoir-text focus:outline-none focus:border-memoir-primary focus:ring-2 focus:ring-memoir-primary/20"
            />
          </div>
        </div>

        {/* Purpose */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-memoir-text-secondary mb-2">
            I use Memoir for
          </label>
          <div className="flex gap-3">
            {[
              { value: "medical", label: "Medical", icon: Heart, color: "#C47A5A" },
              { value: "fitness", label: "Fitness", icon: Dumbbell, color: "#7B9E7B" },
              { value: "both", label: "Both", icon: User, color: "#6B8DAE" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setField("purpose", opt.value)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all"
                style={{
                  borderColor:
                    purpose === opt.value ? opt.color : "var(--memoir-border-light)",
                  backgroundColor:
                    purpose === opt.value ? opt.color + "10" : "transparent",
                  color:
                    purpose === opt.value ? opt.color : "var(--memoir-text-secondary)",
                }}
              >
                <opt.icon size={16} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6 mb-6">
        <h3 className="text-base font-semibold text-memoir-text flex items-center gap-2 mb-4">
          <Bell size={18} className="text-memoir-accent" />
          Notifications
        </h3>
        <div className="space-y-3">
          {[
            { key: "medications" as const, label: "Medication Reminders", desc: "Get notified when it's time to take your meds" },
            { key: "insights" as const, label: "AI Insights", desc: "Receive personalised health insights" },
            { key: "workouts" as const, label: "Workout Reminders", desc: "Get reminded about scheduled workouts" },
            { key: "diary" as const, label: "Diary Prompts", desc: "Evening reminder to journal your day" },
          ].map((n) => (
            <div
              key={n.key}
              className="flex items-center justify-between p-3 rounded-xl bg-memoir-cream/50"
            >
              <div>
                <div className="text-sm font-medium text-memoir-text">
                  {n.label}
                </div>
                <div className="text-xs text-memoir-text-muted">{n.desc}</div>
              </div>
              <button
                onClick={() => toggleNotification(n.key)}
                className="w-11 h-6 rounded-full p-0.5 transition-colors"
                style={{
                  backgroundColor: notifications[n.key]
                    ? "var(--memoir-primary)"
                    : "var(--memoir-sand-dark)",
                }}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-white shadow-sm"
                  animate={{
                    x: notifications[n.key] ? 20 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Privacy */}
      <div className="card p-6 mb-6">
        <h3 className="text-base font-semibold text-memoir-text flex items-center gap-2 mb-4">
          <Shield size={18} className="text-memoir-secondary" />
          Privacy &amp; Security
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-memoir-cream/50">
            <div>
              <div className="text-sm font-medium text-memoir-text">
                Data Encryption
              </div>
              <div className="text-xs text-memoir-text-muted">
                End-to-end encryption for all health data
              </div>
            </div>
            <span className="text-xs font-medium text-memoir-secondary px-2 py-1 rounded-full bg-memoir-secondary-lighter">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-memoir-cream/50">
            <div>
              <div className="text-sm font-medium text-memoir-text">
                Product Tour
              </div>
              <div className="text-xs text-memoir-text-muted">
                Replay the guided tour of Memoir&apos;s features
              </div>
            </div>
            <button onClick={handleRetakeTour} className="text-xs font-medium text-memoir-primary hover:underline">
              Retake
            </button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-memoir-cream/50">
            <div>
              <div className="text-sm font-medium text-memoir-text">
                Export Data
              </div>
              <div className="text-xs text-memoir-text-muted">
                Download all your health data as JSON
              </div>
            </div>
            <button onClick={handleExportData} className="text-xs font-medium text-memoir-primary hover:underline">
              Download
            </button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-memoir-cream/50">
            <div>
              <div className="text-sm font-medium text-memoir-text">
                Delete Account
              </div>
              <div className="text-xs text-memoir-text-muted">
                Permanently delete your account and data
              </div>
            </div>
            <button onClick={handleDeleteAccount} className="text-xs font-medium text-memoir-danger hover:underline">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button onClick={handleSignOut} className="btn-ghost text-sm text-memoir-danger border-memoir-danger/30">
          <LogOut size={14} />
          Sign Out
        </button>
        <button onClick={handleSave} className="btn-primary">
          {saved ? (
            <>
              <Check size={16} />
              Saved!
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
