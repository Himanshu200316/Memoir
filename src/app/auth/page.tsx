"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import WaveBackground from "@/components/WaveBackground";
import { useLocalState } from "@/lib/useLocalState";
import { emptyProfile, type Profile } from "@/lib/data";
import { findAccountByEmail, registerAccount, setActiveUserId } from "@/lib/storage";

const testimonials = [
  {
    quote: "Memoir gave me the confidence to manage my health proactively.",
    author: "Riya P.",
    role: "Heart Patient",
  },
  {
    quote: "The AI insights genuinely surprised me — it caught a pattern I missed.",
    author: "Vikram S.",
    role: "Fitness Coach",
  },
  {
    quote: "Simple, beautiful, and actually useful. I use it every single day.",
    author: "Ananya K.",
    role: "New Mother",
  },
];

const features = [
  "📊 Track medications & symptoms",
  "🏋️ Monitor fitness & nutrition",
  "📔 Journal mood & feelings",
  "🤖 AI-powered health insights",
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const colors = ["#C47070", "#D4A96A", "#D4A96A", "#7B9E7B"];

  return (
    <div className="flex gap-1.5 mt-2">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex-1 h-1.5 rounded-full transition-colors duration-300"
          style={{
            backgroundColor:
              i < strength ? colors[strength - 1] : "var(--memoir-sand)",
          }}
        />
      ))}
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, setSavedProfile] = useLocalState<Profile>("profile", emptyProfile);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    if (field === "email" && value && !isValidEmail(value)) {
      newErrors.email = "Please enter a valid email";
    } else if (field === "password" && value && value.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else {
      delete newErrors[field];
    }
    setErrors(newErrors);
  };

  const switchMode = (m: "signin" | "signup") => {
    setMode(m);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (mode === "signup" && !name.trim()) {
      newErrors.name = "Please enter your name";
    }
    if (!email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password) {
      newErrors.password = "Please enter your password";
    } else if (mode === "signup" && password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (mode === "signup") {
      const existing = findAccountByEmail(email);
      if (existing) {
        setErrors({ email: "An account with this email already exists — try signing in instead." });
        return;
      }
      const userId = registerAccount(email, name.trim());
      setActiveUserId(userId);
      setSavedProfile((prev) => ({ ...prev, name: name.trim(), email: email.trim() }));
      router.push("/onboarding");
    } else {
      const account = findAccountByEmail(email);
      if (!account) {
        setErrors({ email: "No account found with this email — sign up first." });
        return;
      }
      setActiveUserId(account.userId);
      router.push("/dashboard");
    }
  };

  const canSubmit =
    email.trim() !== "" &&
    password !== "" &&
    (mode === "signin" || name.trim() !== "");

  return (
    <div className="min-h-screen flex">
      <WaveBackground />

      {/* Left panel — Brand */}
      <div
        className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-10"
        style={{
          background:
            "linear-gradient(135deg, var(--memoir-primary) 0%, var(--memoir-primary-dark) 100%)",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 no-underline"
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">
            Memoir
          </span>
        </Link>

        {/* Center — Rotating testimonial */}
        <div className="max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-2xl font-light text-white/90 leading-relaxed text-serif italic mb-6">
                &quot;{testimonials[currentTestimonial].quote}&quot;
              </p>
              <div>
                <div className="text-sm font-semibold text-white">
                  {testimonials[currentTestimonial].author}
                </div>
                <div className="text-sm text-white/60">
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex gap-2 mt-6">
            {testimonials.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === currentTestimonial ? 24 : 8,
                  backgroundColor:
                    i === currentTestimonial
                      ? "white"
                      : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom — Feature pills */}
        <div className="flex flex-wrap gap-2">
          {features.map((f) => (
            <div
              key={f}
              className="px-3 py-1.5 text-xs font-medium text-white/80 bg-white/10 rounded-full"
            >
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — Form */}
      <div
        className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-memoir-warm-white relative"
        style={{ zIndex: 1 }}
      >
        <div className="w-full max-w-md">
          {/* Mode toggle */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-memoir-sand/50 mb-8">
            {(["signup", "signin"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className="flex-1 py-2.5 text-sm font-medium rounded-full transition-all"
                style={{
                  backgroundColor:
                    mode === m ? "var(--memoir-warm-white)" : "transparent",
                  color:
                    mode === m
                      ? "var(--memoir-text)"
                      : "var(--memoir-text-muted)",
                  boxShadow: mode === m ? "var(--shadow-sm)" : "none",
                }}
              >
                {m === "signup" ? "Sign Up" : "Sign In"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-memoir-text mb-1">
                {mode === "signup"
                  ? "Create your account"
                  : "Welcome back"}
              </h2>
              <p className="text-sm text-memoir-text-muted mb-6">
                {mode === "signup"
                  ? "Start your health journey today"
                  : "Pick up where you left off"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Google button */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-memoir-border bg-white text-sm font-medium text-memoir-text hover:bg-memoir-sand/20 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-memoir-border" />
                  <span className="text-xs text-memoir-text-muted">or</span>
                  <div className="flex-1 h-px bg-memoir-border" />
                </div>

                {/* Name field — signup only */}
                {mode === "signup" && (
                  <div>
                    <label className="block text-sm font-medium text-memoir-text mb-1.5">
                      Full Name <span className="text-memoir-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-memoir-border bg-white text-sm text-memoir-text placeholder:text-memoir-text-muted focus:outline-none focus:border-memoir-primary focus:ring-2 focus:ring-memoir-primary/20 transition-all"
                      placeholder="Enter your name"
                    />
                    {errors.name && (
                      <p className="text-xs text-memoir-danger mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-memoir-text mb-1.5">
                    Email <span className="text-memoir-danger">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={(e) => validateField("email", e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-memoir-border bg-white text-sm text-memoir-text placeholder:text-memoir-text-muted focus:outline-none focus:border-memoir-primary focus:ring-2 focus:ring-memoir-primary/20 transition-all"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-memoir-danger mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-memoir-text mb-1.5">
                    Password <span className="text-memoir-danger">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={(e) => validateField("password", e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-memoir-border bg-white text-sm text-memoir-text placeholder:text-memoir-text-muted focus:outline-none focus:border-memoir-primary focus:ring-2 focus:ring-memoir-primary/20 transition-all pr-10"
                      placeholder={mode === "signup" ? "Create a strong password" : "Enter your password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-memoir-text-muted hover:text-memoir-text transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-memoir-danger mt-1">
                      {errors.password}
                    </p>
                  )}
                  {mode === "signup" && password && (
                    <PasswordStrength password={password} />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full btn-primary py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {mode === "signup" ? "Create Account" : "Sign In"}
                  <ArrowRight size={16} />
                </button>
              </form>

              {mode === "signin" && (
                <p className="text-center text-xs text-memoir-text-muted mt-4">
                  <a
                    href="#"
                    className="text-memoir-primary hover:underline no-underline"
                  >
                    Forgot password?
                  </a>
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
