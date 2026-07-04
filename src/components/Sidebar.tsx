"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Activity,
  BookHeart,
  Stethoscope,
  Dumbbell,
  MessageCircle,
  FileText,
  User,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Symptoms", href: "/symptoms", icon: Activity },
  { label: "Dear Diary", href: "/diary", icon: BookHeart },
  { label: "Medical", href: "/medical", icon: Stethoscope },
  { label: "Health & Fitness", href: "/health", icon: Dumbbell },
  { label: "AI Chat", href: "/chat", icon: MessageCircle },
  { label: "Documents", href: "/documents", icon: FileText },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("memoir-theme");
    if (stored === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("memoir-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("memoir-theme", "light");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 no-underline" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg bg-memoir-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-lg font-semibold text-memoir-text tracking-tight">
            Memoir
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-memoir-sand transition-colors lg:hidden"
          >
            <X size={18} className="text-memoir-text-muted" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              data-tour={`nav-${item.href.slice(1)}`}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-colors"
              style={{
                color: isActive
                  ? "var(--memoir-primary)"
                  : "var(--memoir-text-secondary)",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "var(--memoir-primary-lighter)" }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon size={18} className="relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          data-tour="nav-theme"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-memoir-sand/40"
          style={{ color: "var(--memoir-text-secondary)" }}
        >
          <motion.div
            animate={{ rotate: isDark ? 180 : 0 }}
            transition={{ duration: 0.4 }}
          >
            {isDark ? (
              <Sun size={18} className="text-memoir-accent" />
            ) : (
              <Moon size={18} />
            )}
          </motion.div>
          <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          {/* Toggle pill */}
          <div
            className="ml-auto w-9 h-5 rounded-full p-0.5 transition-colors"
            style={{
              backgroundColor: isDark ? "var(--memoir-primary)" : "var(--memoir-sand-dark)",
            }}
          >
            <motion.div
              className="w-4 h-4 rounded-full bg-white shadow-sm"
              animate={{ x: isDark ? 16 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </button>

        {/* User card */}
        <Link
          href="/profile"
          onClick={onClose}
          data-tour="nav-profile"
          className="flex items-center gap-3 px-3 py-3 rounded-xl no-underline transition-colors hover:bg-memoir-sand/40"
        >
          <div className="w-9 h-9 rounded-full bg-memoir-primary-lighter flex items-center justify-center">
            <User size={16} style={{ color: "var(--memoir-primary)" }} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-memoir-text">Profile</span>
            <span className="text-xs text-memoir-text-muted">Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 hidden lg:flex flex-col bg-memoir-warm-white border-r border-memoir-border-light"
        style={{ width: "var(--sidebar-width, 220px)", zIndex: 40 }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-memoir-warm-white/90 backdrop-blur-md border-b border-memoir-border-light"
        style={{ zIndex: 45 }}
      >
        <Link href="/dashboard" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 rounded-lg bg-memoir-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs">M</span>
          </div>
          <span className="text-base font-semibold text-memoir-text tracking-tight">Memoir</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl hover:bg-memoir-sand transition-colors"
        >
          <Menu size={20} className="text-memoir-text" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden"
              style={{ zIndex: 50 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              className="fixed left-0 top-0 bottom-0 w-72 bg-memoir-warm-white lg:hidden flex flex-col"
              style={{ zIndex: 51 }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
