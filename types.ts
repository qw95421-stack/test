export interface UserProfile {
  name: string;
  dueDate: string; // ISO string
  prePregnancyWeight?: number;
}

export interface WeightEntry {
  id: string;
  date: string; // ISO string
  weight: number;
}

export interface CheckupEntry {
  id: string;
  date: string; // ISO string
  location: string;
  notes: string;
  completed: boolean;
}

export interface UltrasoundEntry {
  id: string;
  date: string;
  imageUrl: string; // Base64 string
  week: number;
  notes?: string;
  aiAnalysis?: string;
}

export interface AIAdvice {
  week: number;
  tips: string[];
  babyFact: string;
  warningSigns: string[];
}

export enum AppTab {
  DASHBOARD = 'DASHBOARD',
  WEIGHT = 'WEIGHT',
  CHECKUPS = 'CHECKUPS',
  ADVICE = 'ADVICE',
  ULTRASOUND = 'ULTRASOUND'
}