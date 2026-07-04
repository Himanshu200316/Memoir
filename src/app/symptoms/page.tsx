"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Plus, X, Save, Calendar, TrendingUp, Check, Loader2 } from "lucide-react";
import SymptomSlider from "@/components/SymptomSlider";
import { useLocalState } from "@/lib/useLocalState";
import { getActiveUserId } from "@/lib/storage";
import type { TrackedSymptom, SymptomHistoryDay } from "@/lib/data";

const suggestedSymptoms = [
  "Headache", "Fatigue", "Nausea", "Joint Pain", "Back Pain",
  "Dizziness", "Chest Pain", "Shortness of Breath", "Insomnia",
  "Anxiety", "Bloating", "Muscle Cramps",
];

export default function SymptomsPage() {
  const [tab, setTab] = useState<"log" | "history">("log");
  const [trackedSymptoms, setTrackedSymptoms] = useLocalState<TrackedSymptom[]>("symptoms", []);
  const [history, setHistory] = useLocalState<SymptomHistoryDay[]>("symptomHistory", []);
  const [showAdd, setShowAdd] = useState(false);
  const [customSymptom, setCustomSymptom] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const addSymptom = (name: string) => {
    if (!trackedSymptoms.find((s) => s.name === name)) {
      setTrackedSymptoms((prev) => [
        ...prev,
        { id: Date.now().toString(), name, severity: 1 },
      ]);
    }
  };

  const removeSymptom = (id: string) => {
    setTrackedSymptoms((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSeverity = (id: string, severity: number) => {
    setTrackedSymptoms((prev) =>
      prev.map((s) => (s.id === id ? { ...s, severity } : s))
    );
  };

  const handleSave = async () => {
    if (trackedSymptoms.length === 0) return;
    setSaveStatus("saving");
    try {
      await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "symptom_log",
          data: {
            date: new Date().toLocaleDateString("en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            }),
            symptoms: trackedSymptoms.map((s) => ({
              name: s.name,
              severity: s.severity,
            })),
          },
          userId: getActiveUserId(),
        }),
      });

      const avgSeverity =
        Math.round(
          (trackedSymptoms.reduce((s, x) => s + x.severity, 0) / trackedSymptoms.length) * 10
        ) / 10;
      const dateLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
      setHistory((prev) => {
        const withoutToday = prev.filter((d) => d.date !== dateLabel);
        return [...withoutToday, { date: dateLabel, avgSeverity }].slice(-30);
      });

      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    } finally {
      setTimeout(() => setSaveStatus("idle"), 2500);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-memoir-text flex items-center gap-2">
            <Activity size={24} className="text-memoir-primary" />
            Symptom Tracker
          </h1>
          <p className="text-sm text-memoir-text-muted mt-1">
            Log and track your symptoms over time
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-full bg-memoir-sand/50">
          {(["log", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative px-4 py-2 text-sm font-medium rounded-full transition-colors"
              style={{
                color: tab === t ? "var(--memoir-text)" : "var(--memoir-text-muted)",
              }}
            >
              {tab === t && (
                <motion.div
                  layoutId="symptom-tab"
                  className="absolute inset-0 bg-memoir-warm-white rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {t === "log" ? <><Save size={14} /> Daily Log</> : <><TrendingUp size={14} /> History</>}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "log" ? (
          <motion.div
            key="log"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="card p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-memoir-text">
                  Today&apos;s Symptoms
                </h3>
                <button
                  onClick={() => setShowAdd(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-memoir-primary hover:text-memoir-primary-dark transition-colors"
                >
                  <Plus size={14} />
                  Add Symptom
                </button>
              </div>

              {trackedSymptoms.length === 0 ? (
                <div className="text-center py-12">
                  <Activity size={40} className="text-memoir-sand-dark mx-auto mb-3" />
                  <p className="text-sm text-memoir-text-muted">
                    No symptoms being tracked. Add some to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-1 divide-y divide-memoir-border-light">
                  {trackedSymptoms.map((symptom) => (
                    <div key={symptom.id} className="relative group">
                      <SymptomSlider
                        name={symptom.name}
                        value={symptom.severity}
                        onChange={(v) => updateSeverity(symptom.id, v)}
                      />
                      <button
                        onClick={() => removeSymptom(symptom.id)}
                        className="absolute top-3 right-0 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-memoir-sand transition-all"
                      >
                        <X size={12} className="text-memoir-text-muted" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleSave}
                className="w-full btn-primary mt-4 disabled:opacity-60"
                disabled={trackedSymptoms.length === 0 || saveStatus === "saving"}
              >
                {saveStatus === "saving" ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving to Memory...</>
                ) : saveStatus === "saved" ? (
                  <><Check size={16} /> Saved to Memory!</>
                ) : saveStatus === "error" ? (
                  <><Save size={16} /> Error — Try Again</>
                ) : (
                  <><Save size={16} /> Save Today&apos;s Log</>
                )}
              </button>
            </div>

            {/* Add symptom modal */}
            <AnimatePresence>
              {showAdd && (
                <>
                  <motion.div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                    style={{ zIndex: 50 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowAdd(false)}
                  />
                  <div
                    className="fixed inset-0 flex items-center justify-center p-4"
                    style={{ zIndex: 51, pointerEvents: "none" }}
                  >
                  <motion.div
                    className="w-full max-w-md p-6 bg-memoir-warm-white rounded-2xl shadow-xl"
                    style={{ pointerEvents: "auto" }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <h3 className="text-lg font-semibold text-memoir-text mb-4">
                      Add Symptom
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {suggestedSymptoms
                        .filter((s) => !trackedSymptoms.find((t) => t.name === s))
                        .map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              addSymptom(s);
                              setShowAdd(false);
                            }}
                            className="px-3 py-1.5 text-xs font-medium rounded-full bg-memoir-sand hover:bg-memoir-sand-dark transition-colors text-memoir-text-secondary"
                          >
                            + {s}
                          </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSymptom}
                        onChange={(e) => setCustomSymptom(e.target.value)}
                        placeholder="Custom symptom..."
                        className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary"
                      />
                      <button
                        onClick={() => {
                          if (customSymptom.trim()) {
                            addSymptom(customSymptom.trim());
                            setCustomSymptom("");
                            setShowAdd(false);
                          }
                        }}
                        className="btn-primary px-4"
                      >
                        Add
                      </button>
                    </div>
                  </motion.div>
                  </div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Severity history */}
            <div className="card p-5 mb-6">
              <h3 className="text-base font-semibold text-memoir-text flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-memoir-accent" />
                Severity History
              </h3>
              {history.length === 0 ? (
                <p className="text-sm text-memoir-text-muted text-center py-10">
                  Save a daily log to start building your severity history.
                </p>
              ) : (
                <>
                  <div className="flex gap-1 flex-wrap">
                    {history.map((day, i) => (
                      <motion.div
                        key={day.date + i}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-medium cursor-default"
                        style={{
                          backgroundColor:
                            day.avgSeverity <= 2 ? "#7B9E7B20" :
                            day.avgSeverity <= 4 ? "#D4A96A30" :
                            day.avgSeverity <= 6 ? "#C47A5A30" :
                            "#C4707040",
                          color:
                            day.avgSeverity <= 2 ? "#7B9E7B" :
                            day.avgSeverity <= 4 ? "#D4A96A" :
                            day.avgSeverity <= 6 ? "#C47A5A" :
                            "#C47070",
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        title={`${day.date}: ${day.avgSeverity}/10`}
                      >
                        {day.avgSeverity}
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-[10px] text-memoir-text-muted">Severity:</span>
                    {[
                      { label: "Mild", color: "#7B9E7B" },
                      { label: "Moderate", color: "#D4A96A" },
                      { label: "High", color: "#C47A5A" },
                      { label: "Severe", color: "#C47070" },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: l.color + "30" }} />
                        <span className="text-[10px] text-memoir-text-muted">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
