import { supabase } from './supabaseClient';
import { EvaluationResult } from '../types';

export interface Translation {
  id: string;
  user_id: string;
  original_phrase: string;
  user_translation: string;
  correct_translation: string;
  score: number;
  explanation: string;
  tips: string[];
  practice_mode: 'auto' | 'manual';
  source_language: string;
  difficulty_level: string;
  created_at: string;
}

export interface SaveTranslationParams {
  userId: string;
  originalPhrase: string;
  userTranslation: string;
  evaluation: EvaluationResult;
  practiceMode: 'auto' | 'manual';
  sourceLanguage: string;
  difficultyLevel: string;
}

export const supabaseTranslationService = {
  async saveTranslation(params: SaveTranslationParams): Promise<Translation | null> {
    try {
      // Garantir que o score seja um número com 1 casa decimal
      const score = Math.round(Number(params.evaluation.score) * 10) / 10;
      
      const { data, error } = await supabase
        .from('translations')
        .insert({
          user_id: params.userId,
          original_phrase: params.originalPhrase,
          user_translation: params.userTranslation,
          correct_translation: params.evaluation.correction,
          score: score,
          explanation: params.evaluation.explanation,
          tips: params.evaluation.tips,
          practice_mode: params.practiceMode,
          source_language: params.sourceLanguage,
          difficulty_level: params.difficultyLevel
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving translation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error saving translation:', error);
      return null;
    }
  },

  async getUserTranslations(userId: string, limit: number = 50): Promise<Translation[]> {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching translations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching translations:', error);
      return [];
    }
  },

  async getTranslationById(id: string): Promise<Translation | null> {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching translation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching translation:', error);
      return null;
    }
  },

  async deleteTranslation(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting translation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting translation:', error);
      return false;
    }
  },

  async getUserStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('score, practice_mode, difficulty_level')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user stats:', error);
        return null;
      }

      const total = data.length;
      const averageScore = total > 0 
        ? data.reduce((sum, t) => sum + t.score, 0) / total 
        : 0;
      
      const byMode = {
        auto: data.filter(t => t.practice_mode === 'auto').length,
        manual: data.filter(t => t.practice_mode === 'manual').length
      };

      const byDifficulty = {
        Basic: data.filter(t => t.difficulty_level === 'Basic').length,
        Intermediate: data.filter(t => t.difficulty_level === 'Intermediate').length,
        Advanced: data.filter(t => t.difficulty_level === 'Advanced').length
      };

      return {
        total,
        averageScore: Math.round(averageScore * 10) / 10,
        byMode,
        byDifficulty
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }
};
