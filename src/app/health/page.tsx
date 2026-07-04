"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Flame,
  Footprints,
  BedDouble,
  Droplets,
  TrendingUp,
  Target,
  Trophy,
  Plus,
  X,
  Utensils,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLocalState } from "@/lib/useLocalState";
import { todayKey, type Workout, type NutritionLog, type SleepLog } from "@/lib/data";

const WEEKLY_GOALS = { workouts: 5, steps: 10000, sleepHours: 8 };
const NUTRITION_GOALS = { calories: 2200, protein: 120, carbs: 250, fat: 70 };

function lastNDates(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(d.toISOString().split("T")[0]);
  }
  return out;
}

export default function HealthPage() {
  const [workouts, setWorkouts] = useLocalState<Workout[]>("workouts", []);
  const [nutritionLogs, setNutritionLogs] = useLocalState<Record<string, NutritionLog>>("nutritionLogs", {});
  const [sleepLogs, setSleepLogs] = useLocalState<Record<string, SleepLog>>("sleepLogs", {});
  const [stepLogs, setStepLogs] = useLocalState<Record<string, number>>("steps", {});
  const [waterLog, setWaterLog] = useLocalState<Record<string, number>>("water", {});

  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [workoutForm, setWorkoutForm] = useState({ name: "", duration: "", calories: "" });
  const [showNutritionForm, setShowNutritionForm] = useState(false);
  const [nutritionForm, setNutritionForm] = useState({ calories: "", protein: "", carbs: "", fat: "" });
  const [showSleepForm, setShowSleepForm] = useState(false);
  const [sleepForm, setSleepForm] = useState({ totalHours: "", quality: "", deepMin: "", lightMin: "", remMin: "", awakeMin: "" });
  const [stepsInput, setStepsInput] = useState("");

  const today = todayKey();
  const waterGlasses = waterLog[today] || 0;
  const todaysNutrition = nutritionLogs[today] || null;
  const todaysSleep = sleepLogs[today] || null;
  const todaysSteps = stepLogs[today] || 0;

  const weeklySteps = lastNDates(7).map((date) => ({
    day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
    steps: stepLogs[date] || 0,
  }));

  const workoutHistory = [...workouts].sort((a, b) => (a.date < b.date ? 1 : -1));

  const last7 = lastNDates(7);
  const workoutsThisWeek = workouts.filter((w) => last7.includes(w.date)).length;
  const avgStepsThisWeek = Math.round(last7.reduce((s, d) => s + (stepLogs[d] || 0), 0) / 7);
  const sleepValuesThisWeek = last7.map((d) => sleepLogs[d]?.totalHours).filter((v): v is number => !!v);
  const avgSleepThisWeek = sleepValuesThisWeek.length
    ? Math.round((sleepValuesThisWeek.reduce((s, v) => s + v, 0) / sleepValuesThisWeek.length) * 10) / 10
    : 0;

  const addWorkout = () => {
    if (!workoutForm.name.trim()) return;
    setWorkouts((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: workoutForm.name,
        date: today,
        duration: workoutForm.duration || "-",
        calories: Number(workoutForm.calories) || 0,
        exercises: [],
      },
    ]);
    setWorkoutForm({ name: "", duration: "", calories: "" });
    setShowAddWorkout(false);
  };

  const saveNutrition = () => {
    setNutritionLogs((prev) => ({
      ...prev,
      [today]: {
        calories: Number(nutritionForm.calories) || 0,
        protein: Number(nutritionForm.protein) || 0,
        carbs: Number(nutritionForm.carbs) || 0,
        fat: Number(nutritionForm.fat) || 0,
      },
    }));
    setShowNutritionForm(false);
  };

  const saveSleep = () => {
    setSleepLogs((prev) => ({
      ...prev,
      [today]: {
        totalHours: Number(sleepForm.totalHours) || 0,
        quality: Number(sleepForm.quality) || 0,
        deepMin: Number(sleepForm.deepMin) || 0,
        lightMin: Number(sleepForm.lightMin) || 0,
        remMin: Number(sleepForm.remMin) || 0,
        awakeMin: Number(sleepForm.awakeMin) || 0,
      },
    }));
    setShowSleepForm(false);
  };

  const saveSteps = () => {
    const val = Number(stepsInput);
    if (!val) return;
    setStepLogs((prev) => ({ ...prev, [today]: val }));
    setStepsInput("");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-memoir-text flex items-center gap-2">
          <Dumbbell size={24} className="text-memoir-secondary" />
          Health &amp; Fitness
        </h1>
        <p className="text-sm text-memoir-text-muted mt-1">
          Your comprehensive fitness and wellness dashboard
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Calories Burned", value: String(workouts.filter((w) => w.date === today).reduce((s, w) => s + w.calories, 0)), unit: "kcal", icon: Flame, color: "#C47A5A", bg: "#C47A5A15" },
          { label: "Steps Today", value: todaysSteps.toLocaleString(), icon: Footprints, color: "#7B9E7B", bg: "#7B9E7B15" },
          { label: "Sleep Last Night", value: todaysSleep ? `${todaysSleep.totalHours}h` : "-", icon: TrendingUp, color: "#6B8DAE", bg: "#6B8DAE15" },
          { label: "Water", value: `${waterGlasses}/8`, unit: "glasses", icon: Droplets, color: "#D4A96A", bg: "#D4A96A15" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: stat.bg, color: stat.color }}
            >
              <stat.icon size={20} />
            </div>
            <div className="text-xl font-bold text-memoir-text">
              {stat.value}
              {stat.unit && (
                <span className="text-xs font-normal text-memoir-text-muted ml-1">
                  {stat.unit}
                </span>
              )}
            </div>
            <div className="text-xs text-memoir-text-muted">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column — 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Steps chart */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-memoir-text flex items-center gap-2">
                <Footprints size={18} className="text-memoir-secondary" />
                Weekly Steps
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Log today's steps"
                  value={stepsInput}
                  onChange={(e) => setStepsInput(e.target.value)}
                  className="w-36 px-2 py-1 rounded-lg border border-memoir-border bg-white text-xs focus:outline-none focus:border-memoir-primary"
                />
                <button onClick={saveSteps} className="btn-secondary text-xs px-3 py-1">Save</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklySteps}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--memoir-border-light)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--memoir-text-muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--memoir-text-muted)" }} />
                <Tooltip />
                <Bar dataKey="steps" fill="var(--memoir-secondary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Workout History */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-memoir-text flex items-center gap-2">
                <Trophy size={18} className="text-memoir-accent" />
                Workout History
              </h3>
              <button
                onClick={() => setShowAddWorkout(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-memoir-primary hover:text-memoir-primary-dark transition-colors"
              >
                <Plus size={14} /> Log Workout
              </button>
            </div>
            {workoutHistory.length === 0 ? (
              <p className="text-sm text-memoir-text-muted text-center py-8">
                No workouts logged yet.
              </p>
            ) : (
              <div className="space-y-2">
                {workoutHistory.map((w, i) => (
                  <motion.div
                    key={w.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-memoir-cream/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-10 rounded-full bg-memoir-secondary" />
                      <div>
                        <div className="text-sm font-medium text-memoir-text">{w.name}</div>
                        <div className="text-xs text-memoir-text-muted">{w.date} • {w.duration}</div>
                      </div>
                    </div>
                    <span className="text-xs text-memoir-text-muted">{w.calories} kcal</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Nutrition summary */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-memoir-text flex items-center gap-2">
                <Utensils size={18} className="text-memoir-accent" />
                Today&apos;s Nutrition
              </h3>
              <button
                onClick={() => setShowNutritionForm(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-memoir-primary hover:text-memoir-primary-dark transition-colors"
              >
                <Plus size={14} /> {todaysNutrition ? "Update" : "Log"}
              </button>
            </div>
            {!todaysNutrition ? (
              <p className="text-sm text-memoir-text-muted text-center py-8">
                No nutrition logged today.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-4 text-center">
                {[
                  { label: "Calories", current: todaysNutrition.calories, goal: NUTRITION_GOALS.calories, color: "#C47A5A" },
                  { label: "Protein", current: todaysNutrition.protein, goal: NUTRITION_GOALS.protein, unit: "g", color: "#6B8DAE" },
                  { label: "Carbs", current: todaysNutrition.carbs, goal: NUTRITION_GOALS.carbs, unit: "g", color: "#D4A96A" },
                  { label: "Fat", current: todaysNutrition.fat, goal: NUTRITION_GOALS.fat, unit: "g", color: "#7B9E7B" },
                ].map((m) => {
                  const pct = Math.min(Math.round((m.current / m.goal) * 100), 100);
                  return (
                    <div key={m.label}>
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--memoir-sand)" strokeWidth="3" />
                          <motion.circle
                            cx="18" cy="18" r="15.5" fill="none"
                            stroke={m.color}
                            strokeWidth="3"
                            strokeDasharray={`${pct} ${100 - pct}`}
                            strokeLinecap="round"
                            initial={{ strokeDasharray: "0 100" }}
                            animate={{ strokeDasharray: `${pct} ${100 - pct}` }}
                            transition={{ duration: 1, delay: 0.3 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-memoir-text">
                          {pct}%
                        </div>
                      </div>
                      <div className="text-xs font-medium text-memoir-text">{m.label}</div>
                      <div className="text-[10px] text-memoir-text-muted">
                        {m.current}/{m.goal}{m.unit || ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Water tracker */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-memoir-text flex items-center gap-2 mb-3">
              <Droplets size={16} className="text-memoir-blue" />
              Water Intake
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setWaterLog((prev) => ({ ...prev, [today]: i + 1 }))}
                  className="h-12 rounded-xl flex items-center justify-center text-lg transition-colors"
                  style={{
                    backgroundColor: i < waterGlasses ? "#6B8DAE20" : "var(--memoir-sand)",
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  {i < waterGlasses ? "💧" : "○"}
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-memoir-text-muted text-center mt-2">
              {waterGlasses} of 8 glasses
            </p>
          </div>

          {/* Sleep summary */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-memoir-text flex items-center gap-2">
                <BedDouble size={16} className="text-memoir-blue" />
                Last Night&apos;s Sleep
              </h3>
              <button
                onClick={() => setShowSleepForm(true)}
                className="text-xs font-medium text-memoir-primary hover:text-memoir-primary-dark transition-colors"
              >
                {todaysSleep ? "Edit" : "Log"}
              </button>
            </div>
            {!todaysSleep ? (
              <p className="text-xs text-memoir-text-muted text-center py-4">No sleep logged today.</p>
            ) : (
              <>
                <div className="text-center mb-3">
                  <div className="text-3xl font-bold text-memoir-text">{todaysSleep.totalHours}h</div>
                  <p className="text-xs text-memoir-text-muted">Quality: {todaysSleep.quality}%</p>
                </div>
                <div className="space-y-2">
                  {[
                    { stage: "Deep", min: todaysSleep.deepMin, color: "#4A6FA5" },
                    { stage: "Light", min: todaysSleep.lightMin, color: "#8FB0D0" },
                    { stage: "REM", min: todaysSleep.remMin, color: "#BDD4E8" },
                    { stage: "Awake", min: todaysSleep.awakeMin, color: "#E8DDD0" },
                  ].map((s) => (
                    <div key={s.stage} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-xs text-memoir-text-secondary flex-1">{s.stage}</span>
                      <span className="text-xs text-memoir-text-muted">{s.min}m</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Goals */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-memoir-text flex items-center gap-2 mb-3">
              <Target size={16} className="text-memoir-primary" />
              Weekly Goals
            </h3>
            <div className="space-y-3">
              {[
                { label: "Workouts", current: workoutsThisWeek, goal: WEEKLY_GOALS.workouts },
                { label: "Avg Steps", current: avgStepsThisWeek, goal: WEEKLY_GOALS.steps },
                { label: "Avg Sleep", current: avgSleepThisWeek, goal: WEEKLY_GOALS.sleepHours },
              ].map((g) => {
                const pct = Math.min((g.current / g.goal) * 100, 100);
                return (
                  <div key={g.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-memoir-text">{g.label}</span>
                      <span className="text-[10px] text-memoir-text-muted">
                        {g.current}/{g.goal}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-memoir-sand overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-memoir-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add workout modal */}
      <AnimatePresence>
        {showAddWorkout && (
          <>
            <motion.div className="fixed inset-0 bg-black/30 backdrop-blur-sm" style={{ zIndex: 50 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddWorkout(false)} />
            <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 51, pointerEvents: "none" }}>
            <motion.div className="w-full max-w-md p-6 bg-memoir-warm-white rounded-2xl shadow-xl" style={{ pointerEvents: "auto" }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-memoir-text flex items-center gap-2"><Dumbbell size={18} /> Log Workout</h3>
                <button onClick={() => setShowAddWorkout(false)}><X size={16} className="text-memoir-text-muted" /></button>
              </div>
              <div className="space-y-3">
                <input type="text" placeholder="Workout name (e.g. Upper Body Push)" value={workoutForm.name} onChange={(e) => setWorkoutForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <div className="flex gap-2">
                  <input type="text" placeholder="Duration (e.g. 45 min)" value={workoutForm.duration} onChange={(e) => setWorkoutForm((p) => ({ ...p, duration: e.target.value }))} className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                  <input type="number" placeholder="Calories" value={workoutForm.calories} onChange={(e) => setWorkoutForm((p) => ({ ...p, calories: e.target.value }))} className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                </div>
                <button onClick={addWorkout} className="btn-primary w-full">Add Workout</button>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Nutrition form modal */}
      <AnimatePresence>
        {showNutritionForm && (
          <>
            <motion.div className="fixed inset-0 bg-black/30 backdrop-blur-sm" style={{ zIndex: 50 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNutritionForm(false)} />
            <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 51, pointerEvents: "none" }}>
            <motion.div className="w-full max-w-md p-6 bg-memoir-warm-white rounded-2xl shadow-xl" style={{ pointerEvents: "auto" }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-memoir-text flex items-center gap-2"><Utensils size={18} /> Log Today&apos;s Nutrition</h3>
                <button onClick={() => setShowNutritionForm(false)}><X size={16} className="text-memoir-text-muted" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Calories" value={nutritionForm.calories} onChange={(e) => setNutritionForm((p) => ({ ...p, calories: e.target.value }))} className="px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <input type="number" placeholder="Protein (g)" value={nutritionForm.protein} onChange={(e) => setNutritionForm((p) => ({ ...p, protein: e.target.value }))} className="px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <input type="number" placeholder="Carbs (g)" value={nutritionForm.carbs} onChange={(e) => setNutritionForm((p) => ({ ...p, carbs: e.target.value }))} className="px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <input type="number" placeholder="Fat (g)" value={nutritionForm.fat} onChange={(e) => setNutritionForm((p) => ({ ...p, fat: e.target.value }))} className="px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
              </div>
              <button onClick={saveNutrition} className="btn-primary w-full mt-3">Save</button>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Sleep form modal */}
      <AnimatePresence>
        {showSleepForm && (
          <>
            <motion.div className="fixed inset-0 bg-black/30 backdrop-blur-sm" style={{ zIndex: 50 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSleepForm(false)} />
            <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 51, pointerEvents: "none" }}>
            <motion.div className="w-full max-w-md p-6 bg-memoir-warm-white rounded-2xl shadow-xl" style={{ pointerEvents: "auto" }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-memoir-text flex items-center gap-2"><BedDouble size={18} /> Log Last Night&apos;s Sleep</h3>
                <button onClick={() => setShowSleepForm(false)}><X size={16} className="text-memoir-text-muted" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input type="number" step="0.1" placeholder="Total hours" value={sleepForm.totalHours} onChange={(e) => setSleepForm((p) => ({ ...p, totalHours: e.target.value }))} className="px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <input type="number" placeholder="Quality % (0-100)" value={sleepForm.quality} onChange={(e) => setSleepForm((p) => ({ ...p, quality: e.target.value }))} className="px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
              </div>
              <p className="text-xs text-memoir-text-muted mb-2">Stage breakdown (minutes, optional)</p>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Deep" value={sleepForm.deepMin} onChange={(e) => setSleepForm((p) => ({ ...p, deepMin: e.target.value }))} className="px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <input type="number" placeholder="Light" value={sleepForm.lightMin} onChange={(e) => setSleepForm((p) => ({ ...p, lightMin: e.target.value }))} className="px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <input type="number" placeholder="REM" value={sleepForm.remMin} onChange={(e) => setSleepForm((p) => ({ ...p, remMin: e.target.value }))} className="px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <input type="number" placeholder="Awake" value={sleepForm.awakeMin} onChange={(e) => setSleepForm((p) => ({ ...p, awakeMin: e.target.value }))} className="px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
              </div>
              <button onClick={saveSleep} className="btn-primary w-full mt-3">Save</button>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
