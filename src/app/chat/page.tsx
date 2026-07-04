"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Sparkles, User, Loader2 } from "lucide-react";
import { useLocalState } from "@/lib/useLocalState";
import { getActiveUserId } from "@/lib/storage";
import {
  todayKey,
  isTakenToday,
  emptyProfile,
  type Profile,
  type StoredMedication,
  type TrackedSymptom,
  type MoodType,
  type Appointment,
  type SleepLog,
} from "@/lib/data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// Deterministic formatter — avoids a server/client hydration mismatch that
// `toLocaleTimeString` can produce (differing AM/PM casing between ICU builds).
function formatTime(date: Date): string {
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const period = date.getHours() >= 12 ? "PM" : "AM";
  const hours = date.getHours() % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

const suggestedQuestions = [
  "How has my sleep been this week?",
  "What should I know about my medications?",
  "Give me a workout suggestion for today",
  "Analyse my symptom trends",
];

function buildHealthContext(opts: {
  profile: Profile;
  conditions: string[];
  medications: StoredMedication[];
  symptoms: TrackedSymptom[];
  moods: Record<string, MoodType>;
  appointments: Appointment[];
  sleepLogs: Record<string, SleepLog>;
  steps: Record<string, number>;
}): string {
  const { profile, conditions, medications, symptoms, moods, appointments, sleepLogs, steps } = opts;
  const lines: string[] = [];

  const identity = [
    profile.name || null,
    profile.age ? `${profile.age}yo` : null,
    profile.sex || null,
    profile.height ? `${profile.height}cm` : null,
    profile.weight ? `${profile.weight}kg` : null,
  ].filter(Boolean);
  lines.push(`User: ${identity.length ? identity.join(", ") : "Name and details not provided yet"}`);

  if (profile.purpose) lines.push(`Purpose: ${profile.purpose}`);
  if (conditions.length) lines.push(`Conditions: ${conditions.join(", ")}`);

  if (medications.length) {
    lines.push(
      `Medications: ${medications
        .map((m) => `${m.name}${m.dosage ? ` ${m.dosage}` : ""} (${m.frequency || "no frequency set"}, ${isTakenToday(m) ? "taken today" : "not taken today"})`)
        .join("; ")}`
    );
  } else {
    lines.push("Medications: none logged yet");
  }

  if (symptoms.length) {
    lines.push(`Recent symptoms: ${symptoms.map((s) => `${s.name} (${s.severity}/10)`).join(", ")}`);
  }

  const today = todayKey();
  const todaysSleep = sleepLogs[today];
  if (todaysSleep) lines.push(`Sleep last night: ${todaysSleep.totalHours}h, ${todaysSleep.quality}% quality`);

  const todaysSteps = steps[today];
  if (todaysSteps) lines.push(`Steps today: ${todaysSteps}`);

  const todaysMood = moods[today];
  if (todaysMood) lines.push(`Mood today: ${todaysMood}`);

  if (appointments.length) {
    lines.push(
      `Upcoming appointments: ${appointments.map((a) => `${a.doctorName} (${a.specialty}) on ${a.date}`).join("; ")}`
    );
  }

  return lines.join("\n");
}

export default function ChatPage() {
  const [profile] = useLocalState<Profile>("profile", emptyProfile);
  const [conditions] = useLocalState<string[]>("conditions", []);
  const [medications] = useLocalState<StoredMedication[]>("medications", []);
  const [trackedSymptoms] = useLocalState<TrackedSymptom[]>("symptoms", []);
  const [moods] = useLocalState<Record<string, MoodType>>("moods", {});
  const [appointments] = useLocalState<Appointment[]>("appointments", []);
  const [sleepLogs] = useLocalState<Record<string, SleepLog>>("sleepLogs", {});
  const [stepLogs] = useLocalState<Record<string, number>>("steps", {});

  const healthContext = useMemo(
    () =>
      buildHealthContext({
        profile,
        conditions,
        medications,
        symptoms: trackedSymptoms,
        moods,
        appointments,
        sleepLogs,
        steps: stepLogs,
      }),
    [profile, conditions, medications, trackedSymptoms, moods, appointments, sleepLogs, stepLogs]
  );

  const initialMessages: Message[] = useMemo(
    () => [
      {
        id: "1",
        role: "assistant",
        content: profile.name
          ? `Hello ${profile.name}! I'm your Memoir AI health companion. I can help you understand your health data, answer questions about your medications, provide wellness tips, or just chat about how you're feeling. What would you like to talk about?`
          : "Hello! I'm your Memoir AI health companion. I can help you understand your health data, answer questions about your medications, provide wellness tips, or just chat about how you're feeling. What would you like to talk about?",
        timestamp: formatTime(new Date()),
      },
    ],
    [profile.name]
  );

  const [messages, setMessages] = useLocalState<Message[]>("chatMessages", []);
  const displayMessages = messages.length === 0 ? initialMessages : messages;
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: formatTime(new Date()),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    try {
      const apiMessages = nextMessages.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          healthContext,
          userId: getActiveUserId(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "quota_exceeded") {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: data.message,
              timestamp: formatTime(new Date()),
            },
          ]);
          return;
        }
        throw new Error("API error");
      }

      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: formatTime(new Date()),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, response]);
    } catch {
      // Fallback to local mock if API unavailable
      await new Promise((resolve) => setTimeout(resolve, 800));

      const fallback = getFallbackResponse();
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fallback,
        timestamp: formatTime(new Date()),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, response]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 48px)" }}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-memoir-text flex items-center gap-2">
          <MessageCircle size={24} className="text-memoir-primary" />
          AI Health Chat
        </h1>
        <p className="text-sm text-memoir-text-muted mt-1">
          Ask questions about your health data, medications, or get wellness advice
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2">
        {displayMessages.map((msg, i) => (
          <motion.div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i === displayMessages.length - 1 ? 0.1 : 0 }}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-memoir-primary-lighter flex items-center justify-center shrink-0 mt-1">
                <Sparkles size={14} className="text-memoir-primary" />
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-memoir-primary text-white rounded-br-md"
                  : "bg-memoir-warm-white border border-memoir-border-light rounded-bl-md text-serif"
              }`}
              style={{
                color: msg.role === "assistant" ? "var(--memoir-text-secondary)" : undefined,
              }}
            >
              <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
              <div
                className={`text-[10px] mt-1.5 ${
                  msg.role === "user" ? "text-white/60" : "text-memoir-text-muted"
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-memoir-sand flex items-center justify-center shrink-0 mt-1">
                <User size={14} className="text-memoir-text-secondary" />
              </div>
            )}
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-8 h-8 rounded-full bg-memoir-primary-lighter flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-memoir-primary" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-memoir-warm-white border border-memoir-border-light">
              <div className="flex items-center gap-1.5">
                <Loader2 size={14} className="text-memoir-primary animate-spin" />
                <span className="text-xs text-memoir-text-muted">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="px-3 py-2 text-xs font-medium rounded-full bg-memoir-sand hover:bg-memoir-sand-dark transition-colors text-memoir-text-secondary"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your health..."
          className="flex-1 px-4 py-3 rounded-xl border border-memoir-border bg-memoir-warm-white text-sm text-memoir-text placeholder:text-memoir-text-muted focus:outline-none focus:border-memoir-primary focus:ring-2 focus:ring-memoir-primary/20"
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="w-11 h-11 rounded-xl bg-memoir-primary text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-memoir-primary-dark transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

// ─── Fallback responses when API is unavailable ───
function getFallbackResponse(): string {
  return "I'm having trouble reaching the AI service right now, so I can't give you a personalised answer to that. Please try again in a moment — or check your connection and the server logs if this keeps happening.";
}
