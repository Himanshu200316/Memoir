// Shared types + helpers for user-entered app data, persisted via useLocalState.
// Keeping these in one place means Dashboard / Medical / Health pages that all
// read the same store (e.g. "medications") stay in sync automatically.

export function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

/** boolean value for each of the last `days` days (oldest first, today last) */
export function lastNDaysBool(
  log: Record<string, boolean>,
  days = 14
): boolean[] {
  const out: boolean[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(!!log[d.toISOString().split("T")[0]]);
  }
  return out;
}

export interface StoredMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  takenLog: Record<string, boolean>; // date -> taken that day
}

export function isTakenToday(med: StoredMedication): boolean {
  return !!med.takenLog[todayKey()];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone?: string;
  email?: string;
  hospital?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
}

export type MoodType = "great" | "good" | "okay" | "low" | "bad" | "awful";

export interface DiaryEntry {
  id: string;
  date: string;
  mood: MoodType | null;
  content: string;
  tags: string[];
}

export interface WorkoutExercise {
  name: string;
  detail: string;
  done: boolean;
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  duration: string;
  calories: number;
  exercises: WorkoutExercise[];
}

export interface NutritionLog {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface SleepLog {
  totalHours: number;
  quality: number; // 0-100
  deepMin: number;
  lightMin: number;
  remMin: number;
  awakeMin: number;
}

export interface TrackedSymptom {
  id: string;
  name: string;
  severity: number;
}

export interface SymptomHistoryDay {
  date: string;
  avgSeverity: number;
}

export interface Doc {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

export interface Profile {
  name: string;
  email: string;
  age: string;
  sex: string;
  height: string;
  weight: string;
  purpose: string;
}

export const emptyProfile: Profile = {
  name: "",
  email: "",
  age: "",
  sex: "",
  height: "",
  weight: "",
  purpose: "",
};
