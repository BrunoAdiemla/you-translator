
export enum Language {
  PORTUGUESE = 'Portuguese',
  SPANISH = 'Spanish',
  FRENCH = 'French'
}

export enum Difficulty {
  BASIC = 'Basic',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export type ThemeMode = 'light' | 'dark';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  password?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  nativeLanguage: Language;
  proficiency: Difficulty;
  points: number;
  exercisesCompleted: number;
  averageScore: number;
  streak: number;
  lastExerciseDate?: string;
  theme: ThemeMode;
}

export interface EvaluationResult {
  score: number;
  correction: string;
  explanation: string;
  tips: string[];
}

export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  userId: string;
  userTranslation: string;
  evaluation: EvaluationResult;
  timestamp: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  proficiency: Difficulty;
}
