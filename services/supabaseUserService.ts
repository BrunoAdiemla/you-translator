import { supabase } from './supabaseClient';

export interface SupabaseUser {
  id: string;
  email: string;
  name: string;
  first_name: string | null;
  avatar_url: string | null;
  mother_language: string | null;
  study_language: string;
  current_level: string | null;
  xp_score: number;
  total_translations: number;
  hit_percentage: number;
  subscription_plan: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar_url: string | null;
  current_level: string | null;
  points: number;
}

export const supabaseUserService = {
  // Buscar dados do usuário
  async getUserById(userId: string): Promise<SupabaseUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  },

  // Buscar leaderboard com pontuação calculada em tempo real
  async getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    try {
      // Buscar todos os usuários ativos
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, name, avatar_url, current_level')
        .eq('enabled', true);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return [];
      }

      if (!users || users.length === 0) {
        return [];
      }

      // Buscar todas as traduções
      const { data: translations, error: translationsError } = await supabase
        .from('translations')
        .select('user_id, score');

      if (translationsError) {
        console.error('Error fetching translations:', translationsError);
        return [];
      }

      // Calcular pontos para cada usuário
      const leaderboard = users.map((user) => {
        const userTranslations = translations?.filter(t => t.user_id === user.id) || [];
        const totalScore = userTranslations.reduce((sum, t) => sum + (t.score || 0), 0);
        
        return {
          id: user.id,
          name: user.first_name || user.name,
          avatar_url: user.avatar_url,
          current_level: user.current_level,
          points: totalScore * 10
        };
      });

      // Ordenar por pontos (maior para menor) e limitar
      return leaderboard
        .sort((a, b) => b.points - a.points)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  // Buscar pontuação de um usuário específico
  async getUserPoints(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('score')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user points:', error);
        return 0;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      const totalScore = data.reduce((sum, t) => sum + (t.score || 0), 0);
      return totalScore * 10;
    } catch (error) {
      console.error('Error fetching user points:', error);
      return 0;
    }
  },

  // Upload de avatar para o bucket do Supabase
  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload do arquivo para o bucket 'avatars'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Substitui se já existir
        });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return null;
      }

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        console.error('Error getting public URL');
        return null;
      }

      // Atualizar avatar_url no banco de dados
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating avatar URL in database:', updateError);
        return null;
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      return null;
    }
  },

  // Deletar avatar antigo (opcional, para limpar storage)
  async deleteAvatar(avatarUrl: string): Promise<boolean> {
    try {
      // Extrair o caminho do arquivo da URL
      const urlParts = avatarUrl.split('/avatars/');
      if (urlParts.length < 2) return false;
      
      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting avatar:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteAvatar:', error);
      return false;
    }
  },

  // Atualizar dados do usuário após onboarding
  async updateUserOnboarding(
    userId: string,
    data: {
      name: string;
      mother_language: string;
      current_level: string;
    }
  ): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({
        name: data.name,
        mother_language: data.mother_language,
        current_level: data.current_level,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user:', error);
      return false;
    }

    return true;
  },

  // Atualizar perfil do usuário
  async updateUserProfile(
    userId: string,
    data: Partial<SupabaseUser>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      return false;
    }

    return true;
  },
};
