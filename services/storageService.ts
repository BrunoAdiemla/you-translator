
import { UserProfile, ExerciseAttempt, Language, Difficulty, LeaderboardEntry, AuthSession, AuthUser } from "../types";

const STORAGE_KEY_PROFILE = 'you_translator_profile';
const STORAGE_KEY_HISTORY = 'you_translator_history';
const STORAGE_KEY_AUTH = 'you_translator_auth';
const STORAGE_KEY_USERS = 'you_translator_users_db'; // Simulated DB

export const storageService = {
  // --- AUTH METHODS ---
  getAuthSession(): AuthSession | null {
    const data = localStorage.getItem(STORAGE_KEY_AUTH);
    return data ? JSON.parse(data) : null;
  },

  setAuthSession(session: AuthSession | null): void {
    if (session) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  },

  clearAuthSession(): void {
    localStorage.removeItem(STORAGE_KEY_AUTH);
  },

  getUsersDB(): AuthUser[] {
    const data = localStorage.getItem(STORAGE_KEY_USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUserToDB(user: AuthUser): void {
    const users = this.getUsersDB();
    users.push(user);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  },

  // --- PROFILE METHODS ---
  getProfile(): UserProfile | null {
    const data = localStorage.getItem(STORAGE_KEY_PROFILE);
    return data ? JSON.parse(data) : null;
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  },

  updateProfileStats(score: number): UserProfile {
    const profile = this.getProfile()!;
    const newCount = profile.exercisesCompleted + 1;
    const newTotalPoints = profile.points + (score * 10);
    const newAvg = (profile.averageScore * profile.exercisesCompleted + score) / newCount;
    
    // Streak logic
    const today = new Date().toISOString().split('T')[0];
    let newStreak = profile.streak;
    if (profile.lastExerciseDate) {
      const last = new Date(profile.lastExerciseDate);
      const diff = Math.floor((new Date().getTime() - last.getTime()) / (1000 * 3600 * 24));
      if (diff === 1) newStreak += 1;
      else if (diff > 1) newStreak = 1;
    } else {
      newStreak = 1;
    }

    const updated = {
      ...profile,
      exercisesCompleted: newCount,
      points: Math.round(newTotalPoints),
      averageScore: Number(newAvg.toFixed(1)),
      streak: newStreak,
      lastExerciseDate: today
    };
    
    this.saveProfile(updated);
    return updated;
  },

  getHistory(): ExerciseAttempt[] {
    const data = localStorage.getItem(STORAGE_KEY_HISTORY);
    return data ? JSON.parse(data) : [];
  },

  saveAttempt(attempt: ExerciseAttempt): void {
    const history = this.getHistory();
    history.unshift(attempt);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(0, 50)));
  },

  getLeaderboard(): LeaderboardEntry[] {
    return [
      { userId: '1', name: 'Alice Smith', points: 1250, proficiency: Difficulty.ADVANCED },
      { userId: '2', name: 'Jean Dupont', points: 980, proficiency: Difficulty.INTERMEDIATE },
      { userId: '3', name: 'Maria Garcia', points: 840, proficiency: Difficulty.BASIC },
      { userId: '4', name: 'Bob Wilson', points: 720, proficiency: Difficulty.INTERMEDIATE },
    ];
  },

  initializeDefault(name: string, email: string, lang: Language, level: Difficulty): UserProfile {
    const profile: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      nativeLanguage: lang,
      proficiency: level,
      points: 0,
      exercisesCompleted: 0,
      averageScore: 0,
      streak: 0,
      theme: 'dark'
    };
    this.saveProfile(profile);
    return profile;
  }
};
