"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill,
  Activity,
  Brain,
  Shield,
  Dumbbell,
  BookHeart,
  ArrowRight,
  Star,
  Sparkles,
  Menu,
  X,
  Heart,
  Lock,
  MessageCircle,
  BarChart3,
  Zap,
} from "lucide-react";
import BlockGridBackground from "@/components/WaveBackground";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 transition-all duration-300"
      style={{
        zIndex: 50,
        background: scrolled ? "rgba(253, 246, 238, 0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--memoir-border-light)" : "1px solid transparent",
      }}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Link href="/" className="flex items-center gap-2 no-underline">
        <div className="w-8 h-8 rounded-lg bg-memoir-primary flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="text-lg font-semibold text-memoir-text tracking-tight">Memoir</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {[["Features", "#features"], ["How it Works", "#how-it-works"], ["Testimonials", "#testimonials"]].map(([label, href]) => (
          <a key={label} href={href} className="text-sm font-medium text-memoir-text-secondary hover:text-memoir-text transition-colors no-underline">{label}</a>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-3">
        <Link href="/auth" className="btn-ghost text-sm no-underline">Sign In</Link>
        <Link href="/auth" className="btn-primary text-sm no-underline">Get Started <ArrowRight size={14} /></Link>
      </div>

      <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {menuOpen && (
        <motion.div className="absolute top-full left-0 right-0 bg-memoir-warm-white border-b border-memoir-border p-4 flex flex-col gap-4 md:hidden" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <a href="#features" onClick={() => setMenuOpen(false)} className="text-sm text-memoir-text-secondary no-underline">Features</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="text-sm text-memoir-text-secondary no-underline">How it Works</a>
          <a href="#testimonials" onClick={() => setMenuOpen(false)} className="text-sm text-memoir-text-secondary no-underline">Testimonials</a>
          <Link href="/auth" className="btn-primary text-sm text-center no-underline">Get Started</Link>
        </motion.div>
      )}
    </motion.nav>
  );
}

function Hero() {
  const words = ["Health OS", "Fitness OS", "Wellness OS", "Symptom Log", "Mood Journal"];
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrentWord((prev) => (prev + 1) % words.length), 2500);
    return () => clearInterval(interval);
  }, [words.length]);

  const bulletPoints = [
    { icon: Pill, text: "Track medications & symptoms" },
    { icon: Dumbbell, text: "Monitor fitness & nutrition" },
    { icon: BookHeart, text: "Journal mood & feelings" },
    { icon: Brain, text: "AI-powered health insights" },
  ];

  return (
    <section className="relative px-6 pt-32 pb-20 md:pt-40">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1 className="text-5xl md:text-7xl font-bold text-memoir-text leading-tight tracking-tight mb-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
          Your Personal
          <br />
          <span className="relative inline-block min-w-[320px] text-center align-top">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={words[currentWord]}
                className="inline-block whitespace-nowrap text-gradient"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {words[currentWord]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p className="text-lg md:text-xl text-memoir-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          Track medications, log symptoms, monitor fitness, journal your feelings — all in one calm, intelligent, and deeply private space.
        </motion.p>

        <motion.div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          {bulletPoints.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm font-medium text-memoir-text-secondary">
              <Icon size={15} className="text-memoir-primary shrink-0" />
              {text}
            </div>
          ))}
        </motion.div>

        <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Link href="/auth" className="btn-primary text-base px-8 py-3 no-underline">Start Your Memoir <ArrowRight size={16} /></Link>
          <a href="#how-it-works" className="btn-ghost text-base px-8 py-3 no-underline">Learn More</a>
        </motion.div>

        <motion.div className="mt-16 relative" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }}>
          <div className="animate-float">
            <div className="glass-card mx-auto max-w-3xl p-8 rounded-2xl" style={{ boxShadow: "var(--shadow-xl)" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-memoir-danger" />
                <div className="w-3 h-3 rounded-full bg-memoir-warning" />
                <div className="w-3 h-3 rounded-full bg-memoir-success" />
              </div>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {[
                  { icon: Heart, label: "Heart Rate", value: "72 bpm", color: "#C47070" },
                  { icon: Pill, label: "Meds Taken", value: "3/4", color: "#6B8DAE" },
                  { icon: Activity, label: "Steps", value: "8,421", color: "#7B9E7B" },
                  { icon: Zap, label: "Mood", value: "Good", color: "#D4A96A" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: item.color + "12" }}>
                    <div className="flex justify-center mb-1"><item.icon size={22} style={{ color: item.color }} /></div>
                    <div className="text-xs text-memoir-text-muted">{item.label}</div>
                    <div className="text-sm font-bold text-memoir-text mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="h-16 rounded-lg bg-gradient-to-r from-memoir-primary-lighter/30 via-memoir-secondary-light/20 to-memoir-accent-light/30 flex items-center justify-center gap-3">
                <Brain size={16} className="text-memoir-primary" />
                <p className="text-sm text-memoir-text-secondary text-serif italic">&quot;Your sleep improved 12% this week. Keep it up!&quot;</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Marquee() {
  const logos = ["HIPAA Aware", "End-to-End Encrypted", "AI-Powered Insights", "Doctor Approved", "10K+ Users", "Privacy First", "Open Source Friendly"];
  return (
    <div className="py-10 overflow-hidden marquee-mask">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...logos, ...logos].map((text, i) => (
          <span key={i} className="mx-8 text-sm font-medium text-memoir-text-muted">{text}</span>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { step: "01", title: "Tell Us About You", description: "Quick onboarding to understand your health goals — medical tracking, fitness, or both.", icon: Heart, color: "#C47A5A" },
    { step: "02", title: "Track Effortlessly", description: "Log symptoms, medications, workouts, meals, and mood with intuitive, beautiful interfaces.", icon: Activity, color: "#7B9E7B" },
    { step: "03", title: "Get AI Insights", description: "Our AI finds patterns, flags concerns, and gives you personalised health recommendations.", icon: Brain, color: "#6B8DAE" },
  ];
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-bold text-memoir-text mb-4">How Memoir Works</h2>
          <p className="text-memoir-text-secondary max-w-xl mx-auto">Three simple steps to take control of your health journey.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div key={step.step} className="card p-6 text-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: step.color + "18", color: step.color }}>
                <step.icon size={26} />
              </div>
              <div className="text-xs font-bold text-memoir-text-muted mb-2 tracking-widest uppercase">Step {step.step}</div>
              <h3 className="text-lg font-semibold text-memoir-text mb-2">{step.title}</h3>
              <p className="text-sm text-memoir-text-secondary leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: Pill, title: "Medication Tracker", description: "Never miss a dose. Set reminders, track adherence, and share reports with your doctor.", color: "#6B8DAE" },
    { icon: BarChart3, title: "Symptom Logger", description: "Rate severity, track patterns over time, and identify triggers with visual charts.", color: "#C47A5A" },
    { icon: Dumbbell, title: "Fitness Dashboard", description: "Log workouts, track nutrition macros, monitor sleep quality, and hit your goals.", color: "#7B9E7B" },
    { icon: BookHeart, title: "Mood & Diary", description: "Journal your thoughts, track mood patterns, and understand what affects your wellbeing.", color: "#D4A96A" },
    { icon: MessageCircle, title: "AI Health Chat", description: "Ask questions, get insights, and receive personalised health recommendations from AI.", color: "#8B7EC8" },
    { icon: Lock, title: "Privacy First", description: "Your data is encrypted and never shared. You own your health information, always.", color: "#7B9E7B" },
  ];
  return (
    <section id="features" className="py-24 px-6 bg-memoir-cream-dark/30">
      <div className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-bold text-memoir-text mb-4">Everything You Need</h2>
          <p className="text-base font-semibold text-memoir-text max-w-xl mx-auto">
            A comprehensive health companion designed to be calm, warm, and intelligent.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div key={feature.title} className="card p-6 hover:shadow-lg transition-all group" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ backgroundColor: feature.color + "18", color: feature.color }}>
                <feature.icon size={22} />
              </div>
              <h3 className="text-base font-semibold text-memoir-text mb-2">{feature.title}</h3>
              <p className="text-sm text-memoir-text-secondary leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonials = [
    { name: "Priya S.", role: "Living with Type 2 Diabetes", quote: "Memoir changed how I manage my condition. The medication reminders and symptom tracking helped me have much better conversations with my doctor.", rating: 5 },
    { name: "Arjun M.", role: "Fitness Enthusiast", quote: "I love how everything is in one place — my workouts, nutrition, sleep, and mood. The AI insights are surprisingly helpful and feel personal.", rating: 5 },
    { name: "Dr. Meera K.", role: "General Physician", quote: "I recommend Memoir to my patients. The health reports they bring to appointments are detailed and give me a much clearer picture of their daily health.", rating: 5 },
  ];
  return (
    <section id="testimonials" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-bold text-memoir-text mb-4">Loved by Real People</h2>
          <p className="text-memoir-text-secondary max-w-xl mx-auto">See what our community says about their Memoir experience.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} className="card p-6" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} fill="var(--memoir-accent)" color="var(--memoir-accent)" />
                ))}
              </div>
              <p className="text-sm text-memoir-text leading-relaxed text-serif italic mb-4">&quot;{t.quote}&quot;</p>
              <div>
                <div className="text-sm font-semibold text-memoir-text">{t.name}</div>
                <div className="text-xs text-memoir-text-muted">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 px-6">
      <motion.div className="max-w-3xl mx-auto text-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-memoir-primary-lighter/40 text-memoir-primary text-sm font-semibold mb-8">
          <Sparkles size={14} />
          Start for free today
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-memoir-text mb-6 leading-tight">
          Ready to take control
          <br />
          <span className="text-gradient">of your health?</span>
        </h2>

        <p className="text-lg font-medium text-memoir-text-secondary mb-10 max-w-lg mx-auto leading-relaxed">
          Join thousands who trust Memoir as their personal health operating system. It&apos;s free to start.
        </p>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10">
          {[
            { icon: Shield, text: "End-to-end encrypted" },
            { icon: Brain, text: "Powered by AI" },
            { icon: Heart, text: "Doctor recommended" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm font-semibold text-memoir-text">
              <Icon size={15} className="text-memoir-primary" />
              {text}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth" className="btn-primary text-base px-8 py-3 no-underline">
            Get Started — It&apos;s Free <ArrowRight size={16} />
          </Link>
          <Link href="/auth" className="btn-ghost text-base px-8 py-3 no-underline">Sign In</Link>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-memoir-border-light">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-memoir-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs">M</span>
          </div>
          <span className="text-sm font-semibold text-memoir-text">Memoir</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-memoir-text-muted">
          {["Privacy", "Terms", "Support"].map((link) => (
            <a key={link} href="#" className="hover:text-memoir-text transition-colors no-underline">{link}</a>
          ))}
        </div>
        <p className="text-xs text-memoir-text-muted">Built with care in India</p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#FDF6EE" }} data-theme="light">
      <BlockGridBackground />
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <Hero />
        <Marquee />
        <HowItWorks />
        <Features />
        <Testimonials />
        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}
