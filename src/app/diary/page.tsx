"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookHeart, PenLine, Clock, Save, Smile, Check, Loader2 } from "lucide-react";
import { useLocalState } from "@/lib/useLocalState";
import { getActiveUserId } from "@/lib/storage";
import { todayKey, type MoodType, type DiaryEntry } from "@/lib/data";

const moodEmojis: Record<MoodType, string> = {
  great: "😄", good: "🙂", okay: "😐", low: "😔", bad: "😢", awful: "😰",
};

const feelingTags = [
  "Grateful", "Anxious", "Hopeful", "Tired", "Calm",
  "Excited", "Stressed", "Peaceful", "Overwhelmed", "Loved",
];

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

export default function DiaryPage() {
  const [tab, setTab] = useState<"write" | "history">("write");
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [entries, setEntries] = useLocalState<DiaryEntry[]>("diaryEntries", []);
  const [moods, setMoods] = useLocalState<Record<string, MoodType>>("moods", {});

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveEntry = useCallback(async () => {
    if (!content.trim()) return;
    setSaveStatus("saving");
    const today = todayKey();
    const dateLabel = new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    try {
      await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "diary_entry",
          data: {
            mood: selectedMood,
            content: content.trim(),
            tags: selectedTags,
            date: dateLabel,
          },
          userId: getActiveUserId(),
        }),
      });

      setEntries((prev) => [
        { id: Date.now().toString(), date: dateLabel, mood: selectedMood, content: content.trim(), tags: selectedTags },
        ...prev,
      ]);
      if (selectedMood) {
        setMoods((prev) => ({ ...prev, [today]: selectedMood }));
      }

      setSaveStatus("saved");
      // Reset form
      setContent("");
      setSelectedMood(null);
      setSelectedTags([]);
    } catch {
      setSaveStatus("error");
    } finally {
      setTimeout(() => setSaveStatus("idle"), 2500);
    }
  }, [content, selectedMood, selectedTags, setEntries, setMoods]);

  const last7 = lastNDates(7);
  const moodCountsThisWeek = (["great", "good", "okay", "low", "bad"] as MoodType[]).map((mood) => ({
    mood,
    count: last7.filter((d) => moods[d] === mood).length,
  }));

  const streak = (() => {
    const dates = new Set(entries.map((e) => e.date));
    let count = 0;
    const d = new Date();
    while (true) {
      const label = d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      if (!dates.has(label)) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-memoir-text flex items-center gap-2">
            <BookHeart size={24} className="text-memoir-primary" />
            Dear Diary
          </h1>
          <p className="text-sm text-memoir-text-muted mt-1">
            Express your thoughts and track your emotional wellbeing
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-full bg-memoir-sand/50">
          {(["write", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative px-4 py-2 text-sm font-medium rounded-full"
              style={{ color: tab === t ? "var(--memoir-text)" : "var(--memoir-text-muted)" }}
            >
              {tab === t && (
                <motion.div layoutId="diary-tab" className="absolute inset-0 bg-memoir-warm-white rounded-full shadow-sm" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {t === "write" ? <><PenLine size={14} /> Write</> : <><Clock size={14} /> History</>}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "write" ? (
          <motion.div
            key="write"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-[1fr_280px] gap-6"
          >
            {/* Main writing area */}
            <div className="card p-5">
              <h3 className="text-base font-semibold text-memoir-text mb-4">
                How are you feeling today?
              </h3>

              {/* Mood selector */}
              <div className="flex gap-3 mb-5">
                {(Object.entries(moodEmojis) as [MoodType, string][]).map(
                  ([mood, emoji]) => (
                    <motion.button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors"
                      style={{
                        backgroundColor:
                          selectedMood === mood ? "var(--memoir-primary-lighter)" : "transparent",
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-[10px] capitalize text-memoir-text-muted">
                        {mood}
                      </span>
                    </motion.button>
                  )
                )}
              </div>

              {/* Textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write about your day, how you're feeling, or anything on your mind..."
                className="w-full h-64 px-4 py-3 rounded-xl border border-memoir-border bg-white text-sm text-memoir-text placeholder:text-memoir-text-muted focus:outline-none focus:border-memoir-primary focus:ring-2 focus:ring-memoir-primary/20 resize-none text-serif leading-relaxed"
              />

              {/* Feeling tags */}
              <div className="mt-4">
                <p className="text-xs font-medium text-memoir-text-secondary mb-2">
                  I&apos;m feeling...
                </p>
                <div className="flex flex-wrap gap-2">
                  {feelingTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
                      style={{
                        backgroundColor: selectedTags.includes(tag)
                          ? "var(--memoir-primary)"
                          : "var(--memoir-sand)",
                        color: selectedTags.includes(tag) ? "white" : "var(--memoir-text-secondary)",
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="w-full btn-primary mt-5 disabled:opacity-60"
                onClick={handleSaveEntry}
                disabled={!content.trim() || saveStatus === "saving"}
              >
                {saveStatus === "saving" ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving to Memory...</>
                ) : saveStatus === "saved" ? (
                  <><Check size={16} /> Saved to Memory!</>
                ) : saveStatus === "error" ? (
                  <><Save size={16} /> Error — Try Again</>
                ) : (
                  <><Save size={16} /> Save Entry</>
                )}
              </button>
            </div>

            {/* Sidebar - mood stats */}
            <div className="space-y-4">
              <div className="card p-4">
                <h4 className="text-sm font-semibold text-memoir-text mb-3">
                  <Smile size={16} className="inline mr-1.5 text-memoir-accent" />
                  This Week&apos;s Mood
                </h4>
                <div className="space-y-2">
                  {moodCountsThisWeek.map(({ mood, count }) => (
                    <div key={mood} className="flex items-center gap-2">
                      <span className="text-sm w-5">{moodEmojis[mood]}</span>
                      <div className="flex-1 h-2 rounded-full bg-memoir-sand overflow-hidden">
                        <div
                          className="h-full rounded-full bg-memoir-primary"
                          style={{ width: `${(count / 7) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-memoir-text-muted w-4 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-4">
                <h4 className="text-sm font-semibold text-memoir-text mb-2">Streak</h4>
                <div className="text-3xl font-bold text-memoir-primary">{streak}</div>
                <p className="text-xs text-memoir-text-muted">consecutive days journalling</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {entries.length === 0 ? (
              <div className="card p-10 text-center">
                <BookHeart size={40} className="text-memoir-sand-dark mx-auto mb-3" />
                <p className="text-sm text-memoir-text-muted">No diary entries yet. Write your first one!</p>
              </div>
            ) : (
              entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  className="card p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {entry.mood && <span className="text-xl">{moodEmojis[entry.mood]}</span>}
                      {entry.mood && (
                        <span className="text-sm font-semibold text-memoir-text capitalize">
                          {entry.mood}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-memoir-text-muted">{entry.date}</span>
                  </div>
                  <p className="text-sm text-memoir-text-secondary leading-relaxed text-serif">
                    {entry.content}
                  </p>
                  {entry.tags.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-memoir-sand text-memoir-text-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
