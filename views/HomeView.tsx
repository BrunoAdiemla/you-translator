
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { ICONS, LEVELS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { translations } from '../translations';
import { supabaseUserService } from '../services/supabaseUserService';
import { supabaseTranslationService, Translation } from '../services/supabaseTranslationService';
import { cacheService } from '../services/cacheService';
import Logo from '../components/Logo';

interface HomeProps {
  profile: UserProfile;
  supabaseUserId: string;
}

const HomeView: React.FC<HomeProps> = ({ profile, supabaseUserId }) => {
  const navigate = useNavigate();
  const [userPoints, setUserPoints] = useState(profile.points);
  const [recentTranslations, setRecentTranslations] = useState<Translation[]>([]);
  const [loadingTranslations, setLoadingTranslations] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [translationsCount, setTranslationsCount] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [firstName, setFirstName] = useState(profile.name);
  const t = translations[profile.nativeLanguage].home;
  const currentLevel = LEVELS.find(l => l.id === profile.proficiency);

  useEffect(() => {
    const loadUserData = async () => {
      // Cache keys
      const avatarCacheKey = `user_avatar_${supabaseUserId}`;
      const pointsCacheKey = `user_points_${supabaseUserId}`;
      const statsCacheKey = `user_stats_${supabaseUserId}`;

      // Tentar buscar avatar do cache primeiro
      const cachedAvatar = cacheService.get<string>(avatarCacheKey);
      if (cachedAvatar) {
        setAvatarUrl(cachedAvatar);
      }

      // Tentar buscar pontos do cache primeiro
      const cachedPoints = cacheService.get<number>(pointsCacheKey);
      if (cachedPoints !== null) {
        setUserPoints(cachedPoints);
      }

      // Tentar buscar estatísticas do cache primeiro
      const cachedStats = cacheService.get<{ total: number; averageScore: number }>(statsCacheKey);
      if (cachedStats) {
        setTranslationsCount(cachedStats.total);
        setAverageScore(cachedStats.averageScore);
      }

      // Buscar pontos do usuário (sempre busca para atualizar o cache)
      const points = await supabaseUserService.getUserPoints(supabaseUserId);
      setUserPoints(points);
      cacheService.set(pointsCacheKey, points, 10 * 60 * 1000);

      // Buscar dados do usuário (avatar e first_name)
      const userData = await supabaseUserService.getUserById(supabaseUserId);
      if (userData?.avatar_url) {
        setAvatarUrl(userData.avatar_url);
        cacheService.set(avatarCacheKey, userData.avatar_url, 10 * 60 * 1000);
      }
      if (userData?.first_name) {
        setFirstName(userData.first_name);
      }

      // Buscar estatísticas das traduções (sempre busca para atualizar o cache)
      const stats = await supabaseTranslationService.getUserStats(supabaseUserId);
      if (stats) {
        setTranslationsCount(stats.total);
        setAverageScore(stats.averageScore);
        cacheService.set(statsCacheKey, { total: stats.total, averageScore: stats.averageScore }, 10 * 60 * 1000);
      }
    };

    loadUserData();
  }, [supabaseUserId]);

  useEffect(() => {
    const loadRecentTranslations = async () => {
      setLoadingTranslations(true);
      try {
        const translations = await supabaseTranslationService.getUserTranslations(supabaseUserId, 3);
        setRecentTranslations(translations);
      } catch (error) {
        console.error('Error loading recent translations:', error);
      } finally {
        setLoadingTranslations(false);
      }
    };

    loadRecentTranslations();
  }, [supabaseUserId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      if (diffInHours < 1) return 'Agora';
      return `${diffInHours}h atrás`;
    } else if (diffInHours < 48) {
      return t.yesterday;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} dias atrás`;
    }
  };

  return (
    <div className="p-6 pt-10 space-y-6 bg-white dark:bg-slate-900 min-h-screen">
      <div className="flex items-center justify-center mb-4">
        <Logo size="sm" />
      </div>
      
      <header className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">{t.welcome}</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">{firstName}!</h1>
        </div>
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={firstName} 
            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-900 shadow-sm"
          />
        ) : (
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
            {firstName.charAt(0)}
          </div>
        )}
      </header>

      <div className="bg-indigo-600 dark:bg-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              {currentLevel?.label}
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-amber-400">🔥</span>
              <span className="font-bold">{profile.streak} {t.streak}</span>
            </div>
          </div>
          <div>
            <p className="text-indigo-100 text-sm">{t.totalScore}</p>
            <h2 className="text-4xl font-black font-heading">{userPoints} XP</h2>
          </div>
          <button 
            onClick={() => navigate('/practice')}
            className="w-full py-3 bg-white dark:bg-slate-100 text-indigo-600 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>{t.continuePractice}</span>
            {ICONS.Next}
          </button>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl shadow-sm space-y-2">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            {ICONS.Success}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{translationsCount}</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs">{t.completed}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl shadow-sm space-y-2">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
            {ICONS.Stats}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{averageScore}/10</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs">{t.average}</p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white">{t.recentHistory}</h3>
          <button 
            onClick={() => navigate('/history')}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider"
          >
            {t.viewAll}
          </button>
        </div>
        
        {loadingTranslations ? (
          <div className="bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 rounded-2xl text-center">
            <div className="w-8 h-8 mx-auto border-2 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : recentTranslations.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 rounded-2xl text-center">
            <p className="text-slate-400 dark:text-slate-500 text-sm">{t.noExercises}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTranslations.map((translation, index) => (
              <button
                key={translation.id}
                onClick={() => navigate(`/history/${translation.id}`)}
                className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center space-x-4 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                  <span className="font-bold">#{index + 1}</span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {translation.original_phrase}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tighter">
                    {formatDate(translation.created_at)} • {translation.score * 10} XP
                  </p>
                </div>
                <div className={`text-lg font-bold flex-shrink-0 ${
                  translation.score >= 7 
                    ? 'text-emerald-500 dark:text-emerald-400' 
                    : 'text-amber-500 dark:text-amber-400'
                }`}>
                  {translation.score}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeView;
