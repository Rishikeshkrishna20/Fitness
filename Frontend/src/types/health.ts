export interface User {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  height?: number;
  weight?: number;
  goal?: string;
  avatar?: string;
  age?: number;
  gender?: string;
  bloodType?: string;
  emergencyContact?: string;
  medicalConditions?: string[];
  allergies?: string[];
}

export interface WorkoutLog {
  id: string;
  type: string;
  duration: number;
  calories: number;
  date: string;
  intensity?: 'Low' | 'Medium' | 'High';
  notes?: string;
}

export interface WaterLog {
  id: string;
  amount: number;
  timestamp: string;
}

export interface MealLog {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface SleepLog {
  id: string;
  start: string;
  end: string;
  duration: number;
  quality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  notes?: string;
}

export interface VitalLog {
  id: string;
  type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'glucose' | 'oxygen';
  value: number | string;
  timestamp: string;
  notes?: string;
}

export interface MedicationLog {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

export interface MoodLog {
  id: string;
  mood: 'Excellent' | 'Good' | 'Neutral' | 'Bad' | 'Terrible';
  timestamp: string;
  notes?: string;
}

export interface HealthGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  category: 'weight' | 'workout' | 'nutrition' | 'water' | 'sleep' | 'other';
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  units: 'metric' | 'imperial';
  privacyLevel: 'private' | 'friends' | 'public';
  language: string;
}
