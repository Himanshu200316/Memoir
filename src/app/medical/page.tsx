"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Pill, BarChart3, UserRound, Check, Clock, Phone, Mail, Plus, X, Trash2, Droplet } from "lucide-react";
import AdherenceBar from "@/components/AdherenceBar";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useLocalState } from "@/lib/useLocalState";
import {
  todayKey,
  lastNDaysBool,
  isTakenToday,
  type StoredMedication,
  type Doctor,
  type SymptomHistoryDay,
} from "@/lib/data";

interface BloodSugarReading {
  id: string;
  date: string;
  fasting: number;
  postMeal: number;
}

export default function MedicalPage() {
  const [tab, setTab] = useState<"medications" | "charts" | "doctors">("medications");
  const [medications, setMedications] = useLocalState<StoredMedication[]>("medications", []);
  const [doctors, setDoctors] = useLocalState<Doctor[]>("doctors", []);
  const [symptomHistory] = useLocalState<SymptomHistoryDay[]>("symptomHistory", []);
  const [bloodSugar, setBloodSugar] = useLocalState<BloodSugarReading[]>("bloodSugarReadings", []);

  const [showAddMed, setShowAddMed] = useState(false);
  const [medForm, setMedForm] = useState({ name: "", dosage: "", frequency: "", time: "" });
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [doctorForm, setDoctorForm] = useState({ name: "", specialty: "", phone: "", email: "", hospital: "" });
  const [showAddReading, setShowAddReading] = useState(false);
  const [readingForm, setReadingForm] = useState({ fasting: "", postMeal: "" });

  const tabs = [
    { key: "medications" as const, label: "Medications", icon: Pill },
    { key: "charts" as const, label: "Charts", icon: BarChart3 },
    { key: "doctors" as const, label: "Doctors", icon: UserRound },
  ];

  const addMedication = () => {
    if (!medForm.name.trim()) return;
    setMedications((prev) => [
      ...prev,
      { id: Date.now().toString(), ...medForm, takenLog: {} },
    ]);
    setMedForm({ name: "", dosage: "", frequency: "", time: "" });
    setShowAddMed(false);
  };

  const removeMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleTaken = (id: string) => {
    const today = todayKey();
    setMedications((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, takenLog: { ...m.takenLog, [today]: !isTakenToday(m) } } : m
      )
    );
  };

  const addDoctor = () => {
    if (!doctorForm.name.trim()) return;
    setDoctors((prev) => [...prev, { id: Date.now().toString(), ...doctorForm }]);
    setDoctorForm({ name: "", specialty: "", phone: "", email: "", hospital: "" });
    setShowAddDoctor(false);
  };

  const removeDoctor = (id: string) => {
    setDoctors((prev) => prev.filter((d) => d.id !== id));
  };

  const addReading = () => {
    const fasting = Number(readingForm.fasting);
    const postMeal = Number(readingForm.postMeal);
    if (!fasting && !postMeal) return;
    setBloodSugar((prev) => [
      ...prev,
      { id: Date.now().toString(), date: todayKey(), fasting, postMeal },
    ]);
    setReadingForm({ fasting: "", postMeal: "" });
    setShowAddReading(false);
  };

  // Adherence across all medications, per day, last 14 days
  const dailyAdherenceData = (() => {
    if (medications.length === 0) return [];
    const days = lastNDaysBool(medications[0].takenLog).length;
    const now = new Date();
    const rows = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const takenCount = medications.filter((m) => m.takenLog[key]).length;
      rows.push({
        day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        adherence: Math.round((takenCount / medications.length) * 100),
      });
    }
    return rows;
  })();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-memoir-text flex items-center gap-2">
          <Stethoscope size={24} className="text-memoir-primary" />
          Medical Centre
        </h1>
        <p className="text-sm text-memoir-text-muted mt-1">
          Manage medications, view health charts, and contact your doctors
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-memoir-sand/50 w-fit mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="relative px-4 py-2 text-sm font-medium rounded-full"
            style={{ color: tab === t.key ? "var(--memoir-text)" : "var(--memoir-text-muted)" }}
          >
            {tab === t.key && (
              <motion.div layoutId="med-tab" className="absolute inset-0 bg-memoir-warm-white rounded-full shadow-sm" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <t.icon size={14} /> {t.label}
            </span>
          </button>
        ))}
      </div>

      {tab === "medications" && (
        <div className="space-y-4">
          <button
            onClick={() => setShowAddMed(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-memoir-primary hover:text-memoir-primary-dark transition-colors mb-2"
          >
            <Plus size={16} /> Add Medication
          </button>

          {medications.length === 0 ? (
            <div className="card p-10 text-center">
              <Pill size={36} className="text-memoir-sand-dark mx-auto mb-3" />
              <p className="text-sm text-memoir-text-muted">No medications added yet.</p>
            </div>
          ) : (
            medications.map((med, i) => {
              const taken = isTakenToday(med);
              return (
                <motion.div
                  key={med.id}
                  className="card p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-memoir-text">{med.name}</h3>
                      <p className="text-xs text-memoir-text-muted">{med.frequency} • {med.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTaken(med.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: taken ? "var(--memoir-secondary-lighter)" : "var(--memoir-sand)",
                          color: taken ? "var(--memoir-secondary-dark)" : "var(--memoir-text-muted)",
                        }}
                      >
                        {taken ? <Check size={12} /> : <Clock size={12} />}
                        {taken ? "Taken today" : "Pending"}
                      </button>
                      <button onClick={() => removeMedication(med.id)} className="p-1.5 rounded-lg hover:bg-memoir-sand transition-colors">
                        <Trash2 size={14} className="text-memoir-text-muted" />
                      </button>
                    </div>
                  </div>
                  <AdherenceBar data={lastNDaysBool(med.takenLog)} label="14-Day Adherence" />
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {tab === "charts" && (
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="text-base font-semibold text-memoir-text mb-4">Daily Adherence (Last 14 Days)</h3>
            {dailyAdherenceData.length === 0 ? (
              <p className="text-sm text-memoir-text-muted text-center py-10">
                Add medications to see adherence trends.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyAdherenceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--memoir-border-light)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--memoir-text-muted)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--memoir-text-muted)" }} />
                  <Tooltip />
                  <Bar dataKey="adherence" fill="var(--memoir-secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card p-5">
            <h3 className="text-base font-semibold text-memoir-text mb-4">Symptom Severity Trend</h3>
            {symptomHistory.length === 0 ? (
              <p className="text-sm text-memoir-text-muted text-center py-10">
                Log symptoms on the Symptoms page to see trends here.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={symptomHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--memoir-border-light)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--memoir-text-muted)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--memoir-text-muted)" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgSeverity" stroke="#C47A5A" strokeWidth={2} dot={false} name="Avg Severity" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-memoir-text">Blood Sugar Levels</h3>
              <button
                onClick={() => setShowAddReading(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-memoir-primary hover:text-memoir-primary-dark transition-colors"
              >
                <Droplet size={14} /> Log Reading
              </button>
            </div>
            {bloodSugar.length === 0 ? (
              <p className="text-sm text-memoir-text-muted text-center py-10">
                No readings logged yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={bloodSugar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--memoir-border-light)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--memoir-text-muted)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--memoir-text-muted)" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="fasting" stroke="#7B9E7B" strokeWidth={2} dot={false} name="Fasting" />
                  <Line type="monotone" dataKey="postMeal" stroke="#C47A5A" strokeWidth={2} dot={false} name="Post-meal" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {tab === "doctors" && (
        <div>
          <button
            onClick={() => setShowAddDoctor(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-memoir-primary hover:text-memoir-primary-dark transition-colors mb-4"
          >
            <Plus size={16} /> Add Doctor
          </button>
          {doctors.length === 0 ? (
            <div className="card p-10 text-center">
              <UserRound size={36} className="text-memoir-sand-dark mx-auto mb-3" />
              <p className="text-sm text-memoir-text-muted">No doctors added yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  className="card p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold bg-memoir-primary">
                        {doc.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-memoir-text">{doc.name}</h3>
                        <p className="text-xs text-memoir-text-muted">{doc.specialty}</p>
                      </div>
                    </div>
                    <button onClick={() => removeDoctor(doc.id)} className="p-1.5 rounded-lg hover:bg-memoir-sand transition-colors">
                      <Trash2 size={14} className="text-memoir-text-muted" />
                    </button>
                  </div>
                  {doc.hospital && <p className="text-xs text-memoir-text-secondary mb-3">{doc.hospital}</p>}
                  <div className="space-y-2">
                    {doc.phone && (
                      <a href={`tel:${doc.phone}`} className="flex items-center gap-2 text-xs text-memoir-blue hover:underline no-underline">
                        <Phone size={12} /> {doc.phone}
                      </a>
                    )}
                    {doc.email && (
                      <a href={`mailto:${doc.email}`} className="flex items-center gap-2 text-xs text-memoir-blue hover:underline no-underline">
                        <Mail size={12} /> {doc.email}
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add medication modal */}
      <AnimatePresence>
        {showAddMed && (
          <>
            <motion.div className="fixed inset-0 bg-black/30 backdrop-blur-sm" style={{ zIndex: 50 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddMed(false)} />
            <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 51, pointerEvents: "none" }}>
            <motion.div className="w-full max-w-md p-6 bg-memoir-warm-white rounded-2xl shadow-xl" style={{ pointerEvents: "auto" }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-memoir-text flex items-center gap-2"><Pill size={18} /> Add Medication</h3>
                <button onClick={() => setShowAddMed(false)}><X size={16} className="text-memoir-text-muted" /></button>
              </div>
              <div className="space-y-3">
                <input type="text" placeholder="Medication name (e.g. Metformin 500mg)" value={medForm.name} onChange={(e) => setMedForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <input type="text" placeholder="Dosage (e.g. 500mg)" value={medForm.dosage} onChange={(e) => setMedForm((p) => ({ ...p, dosage: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <input type="text" placeholder="Frequency (e.g. Twice daily)" value={medForm.frequency} onChange={(e) => setMedForm((p) => ({ ...p, frequency: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <input type="text" placeholder="Time (e.g. 8 AM, 8 PM)" value={medForm.time} onChange={(e) => setMedForm((p) => ({ ...p, time: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <button onClick={addMedication} className="btn-primary w-full">Add Medication</button>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Add doctor modal */}
      <AnimatePresence>
        {showAddDoctor && (
          <>
            <motion.div className="fixed inset-0 bg-black/30 backdrop-blur-sm" style={{ zIndex: 50 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddDoctor(false)} />
            <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 51, pointerEvents: "none" }}>
            <motion.div className="w-full max-w-md p-6 bg-memoir-warm-white rounded-2xl shadow-xl" style={{ pointerEvents: "auto" }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-memoir-text flex items-center gap-2"><UserRound size={18} /> Add Doctor</h3>
                <button onClick={() => setShowAddDoctor(false)}><X size={16} className="text-memoir-text-muted" /></button>
              </div>
              <div className="space-y-3">
                <input type="text" placeholder="Doctor name" value={doctorForm.name} onChange={(e) => setDoctorForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <input type="text" placeholder="Specialty" value={doctorForm.specialty} onChange={(e) => setDoctorForm((p) => ({ ...p, specialty: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <input type="text" placeholder="Hospital / Clinic" value={doctorForm.hospital} onChange={(e) => setDoctorForm((p) => ({ ...p, hospital: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <input type="tel" placeholder="Phone" value={doctorForm.phone} onChange={(e) => setDoctorForm((p) => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <input type="email" placeholder="Email" value={doctorForm.email} onChange={(e) => setDoctorForm((p) => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <button onClick={addDoctor} className="btn-primary w-full">Add Doctor</button>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Add blood sugar reading modal */}
      <AnimatePresence>
        {showAddReading && (
          <>
            <motion.div className="fixed inset-0 bg-black/30 backdrop-blur-sm" style={{ zIndex: 50 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddReading(false)} />
            <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 51, pointerEvents: "none" }}>
            <motion.div className="w-full max-w-md p-6 bg-memoir-warm-white rounded-2xl shadow-xl" style={{ pointerEvents: "auto" }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-memoir-text flex items-center gap-2"><Droplet size={18} /> Log Blood Sugar Reading</h3>
                <button onClick={() => setShowAddReading(false)}><X size={16} className="text-memoir-text-muted" /></button>
              </div>
              <div className="space-y-3">
                <input type="number" placeholder="Fasting (mg/dL)" value={readingForm.fasting} onChange={(e) => setReadingForm((p) => ({ ...p, fasting: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <input type="number" placeholder="Post-meal (mg/dL)" value={readingForm.postMeal} onChange={(e) => setReadingForm((p) => ({ ...p, postMeal: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-memoir-border bg-white text-sm focus:outline-none focus:border-memoir-primary" />
                <button onClick={addReading} className="btn-primary w-full">Save Reading</button>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
