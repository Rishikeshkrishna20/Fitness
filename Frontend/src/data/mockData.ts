
import { 
  User, 
  WorkoutLog, 
  WaterLog, 
  MealLog, 
  SleepLog, 
  VitalLog, 
  MedicationLog, 
  MoodLog, 
  HealthGoal 
} from "@/types/health";

import { v4 as uuidv4 } from 'uuid';

// Helper to create consistent dates over the past few days
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Helper for random number between min and max
const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Mock current user
export const currentUser: User = {
  id: uuidv4(),
  email: "johndoe@example.com",
  name: "John Doe",
  height: 178,
  weight: 75,
  goal: "Improve overall fitness and establish healthy habits",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  age: 32,
  gender: "Male",
  bloodType: "O+",
  emergencyContact: "Jane Doe (555-123-4567)",
  medicalConditions: ["Mild asthma"],
  allergies: ["Peanuts"]
};

// Mock workout logs
export const workoutLogs: WorkoutLog[] = [
  {
    id: uuidv4(),
    type: "Running",
    duration: 30,
    calories: 320,
    date: daysAgo(0),
    intensity: "Medium",
    notes: "Morning run around the park"
  },
  {
    id: uuidv4(),
    type: "Strength Training",
    duration: 45,
    calories: 380,
    date: daysAgo(1),
    intensity: "High",
    notes: "Focused on upper body"
  },
  {
    id: uuidv4(),
    type: "Yoga",
    duration: 60,
    calories: 200,
    date: daysAgo(2),
    intensity: "Low",
    notes: "Relaxation yoga session"
  },
  {
    id: uuidv4(),
    type: "Cycling",
    duration: 40,
    calories: 350,
    date: daysAgo(3),
    intensity: "Medium",
    notes: "City bike tour"
  },
  {
    id: uuidv4(),
    type: "Swimming",
    duration: 35,
    calories: 300,
    date: daysAgo(4),
    intensity: "Medium",
    notes: "Pool laps"
  }
];

// Mock water logs
export const waterLogs: WaterLog[] = [
  { id: uuidv4(), amount: 350, timestamp: new Date(new Date().setHours(8, 30)).toISOString() },
  { id: uuidv4(), amount: 250, timestamp: new Date(new Date().setHours(10, 15)).toISOString() },
  { id: uuidv4(), amount: 500, timestamp: new Date(new Date().setHours(13, 0)).toISOString() },
  { id: uuidv4(), amount: 250, timestamp: new Date(new Date().setHours(15, 45)).toISOString() },
  { id: uuidv4(), amount: 350, timestamp: new Date(new Date().setHours(18, 30)).toISOString() },
];

// Calculate total water intake for today
export const todayWaterIntake = waterLogs.reduce((total, log) => total + log.amount, 0);

// Mock meal logs
export const mealLogs: MealLog[] = [
  {
    id: uuidv4(),
    name: "Oatmeal with fruits",
    calories: 350,
    protein: 12,
    carbs: 55,
    fat: 6,
    timestamp: new Date(new Date().setHours(7, 30)).toISOString(),
    type: "breakfast"
  },
  {
    id: uuidv4(),
    name: "Chicken salad",
    calories: 450,
    protein: 35,
    carbs: 20,
    fat: 15,
    timestamp: new Date(new Date().setHours(12, 30)).toISOString(),
    type: "lunch"
  },
  {
    id: uuidv4(),
    name: "Protein bar",
    calories: 180,
    protein: 15,
    carbs: 20,
    fat: 8,
    timestamp: new Date(new Date().setHours(16, 0)).toISOString(),
    type: "snack"
  }
];

// Calculate total calories for today
export const todayCaloriesIntake = mealLogs.reduce((total, meal) => total + meal.calories, 0);

// Mock sleep logs
export const sleepLogs: SleepLog[] = [
  {
    id: uuidv4(),
    start: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(23, 0, 0, 0).toString(),
    end: new Date().setHours(7, 0, 0, 0).toString(),
    duration: 8, // hours
    quality: "Good",
    notes: "Restful night"
  },
  {
    id: uuidv4(),
    start: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(23, 30, 0, 0).toString(),
    end: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(7, 15, 0, 0).toString(),
    duration: 7.75, // hours
    quality: "Fair",
    notes: "Woke up once"
  },
  {
    id: uuidv4(),
    start: new Date(new Date().setDate(new Date().getDate() - 3)).setHours(23, 15, 0, 0).toString(),
    end: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(6, 45, 0, 0).toString(),
    duration: 7.5, // hours
    quality: "Good",
    notes: ""
  },
];

// Mock vital logs
export const vitalLogs: VitalLog[] = [
  {
    id: uuidv4(),
    type: "heart_rate",
    value: 72,
    timestamp: new Date().toISOString(),
    notes: "Resting heart rate"
  },
  {
    id: uuidv4(),
    type: "blood_pressure",
    value: "120/80",
    timestamp: daysAgo(0),
    notes: "Morning reading"
  },
  {
    id: uuidv4(),
    type: "temperature",
    value: 36.6,
    timestamp: daysAgo(0),
    notes: ""
  },
  {
    id: uuidv4(),
    type: "oxygen",
    value: 98,
    timestamp: daysAgo(0),
    notes: ""
  },
];

// Mock medication logs
export const medicationLogs: MedicationLog[] = [
  {
    id: uuidv4(),
    name: "Vitamin D",
    dosage: "1000 IU",
    time: "08:00",
    taken: true
  },
  {
    id: uuidv4(),
    name: "Fish Oil",
    dosage: "1000 mg",
    time: "08:00",
    taken: true
  },
  {
    id: uuidv4(),
    name: "Multivitamin",
    dosage: "1 tablet",
    time: "08:00",
    taken: true
  },
  {
    id: uuidv4(),
    name: "Zinc",
    dosage: "50 mg",
    time: "20:00",
    taken: false
  }
];

// Mock mood logs
export const moodLogs: MoodLog[] = [
  {
    id: uuidv4(),
    mood: "Good",
    timestamp: new Date().toISOString(),
    notes: "Feeling productive today"
  },
  {
    id: uuidv4(),
    mood: "Excellent",
    timestamp: daysAgo(1),
    notes: "Great workout session"
  },
  {
    id: uuidv4(),
    mood: "Neutral",
    timestamp: daysAgo(2),
    notes: "Busy day at work"
  },
  {
    id: uuidv4(),
    mood: "Good",
    timestamp: daysAgo(3),
    notes: "Nice weather"
  }
];

// Mock health goals
export const healthGoals: HealthGoal[] = [
  {
    id: uuidv4(),
    name: "Daily water intake",
    target: 2500,
    current: todayWaterIntake,
    unit: "ml",
    category: "water"
  },
  {
    id: uuidv4(),
    name: "Weight goal",
    target: 70,
    current: 75,
    unit: "kg",
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
    category: "weight"
  },
  {
    id: uuidv4(),
    name: "Weekly workouts",
    target: 5,
    current: 3,
    unit: "sessions",
    category: "workout"
  },
  {
    id: uuidv4(),
    name: "Sleep duration",
    target: 8,
    current: 7.5,
    unit: "hours",
    category: "sleep"
  }
];

// Health insights
export const healthInsights = [
  "Your sleep quality has improved by 15% over the past week",
  "Try to increase your water intake to reach your daily goal",
  "You're consistently hitting your workout targets - great job!",
  "Your resting heart rate is in the healthy range",
  "Consider adding more protein to your diet based on your current intake"
];

// Weekly activity data for charts
export const weeklyActivityData = [
  { day: "Mon", calories: 320, workout: 30 },
  { day: "Tue", calories: 450, workout: 45 },
  { day: "Wed", calories: 280, workout: 25 },
  { day: "Thu", calories: 390, workout: 40 },
  { day: "Fri", calories: 430, workout: 50 },
  { day: "Sat", calories: 500, workout: 60 },
  { day: "Sun", calories: 350, workout: 35 }
];

// Nutrient breakdown for charts
export const nutrientBreakdown = [
  { name: "Protein", value: 25 },
  { name: "Carbs", value: 50 },
  { name: "Fat", value: 25 }
];

// Sleep patterns for charts
export const sleepPatterns = [
  { date: "Apr 1", duration: 7.5, quality: 85 },
  { date: "Apr 2", duration: 6.8, quality: 70 },
  { date: "Apr 3", duration: 8.2, quality: 90 },
  { date: "Apr 4", duration: 7.9, quality: 85 },
  { date: "Apr 5", duration: 7.6, quality: 80 },
  { date: "Apr 6", duration: 8.0, quality: 88 }
];
