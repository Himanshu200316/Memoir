// ─── Memoir Types ───

export interface Profile {
  id: string;
  name: string;
  email: string;
  age?: number;
  sex?: 'male' | 'female' | 'other';
  heightCm?: number;
  weightKg?: number;
  purpose: 'medical' | 'fitness' | 'both';
  avatarUrl?: string;
  createdAt: string;
}

export interface Condition {
  id: string;
  name: string;
  diagnosedDate?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  taken: boolean;
  adherence: boolean[]; // last 14 days
}

export interface Symptom {
  id: string;
  name: string;
  icon?: string;
  severity: number; // 1-10
  lastLogged?: string;
}

export interface SymptomLog {
  id: string;
  symptomId: string;
  severity: number;
  date: string;
  notes?: string;
}

export type MoodType = 'great' | 'good' | 'okay' | 'low' | 'bad' | 'awful';

export interface MoodLog {
  id: string;
  mood: MoodType;
  date: string;
  factors?: string[];
  notes?: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  mood: MoodType;
  content: string;
  tags: string[];
  createdAt: string;
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
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
}

export interface WorkoutExercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number; // minutes
  completed: boolean;
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: WorkoutExercise[];
  duration: number; // minutes
  caloriesBurned: number;
}

export interface NutritionLog {
  id: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number; // glasses
}

export interface SleepLog {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  totalHours: number;
  quality: number; // 1-5
  stages: {
    deep: number;
    light: number;
    rem: number;
    awake: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  extractedData?: string;
  url?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export interface MetricCardData {
  label: string;
  value: number;
  unit?: string;
  subLabel?: string;
  color: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}
