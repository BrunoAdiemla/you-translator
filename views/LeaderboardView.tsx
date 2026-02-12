
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabaseUserService, LeaderboardEntry } from '../services/supabaseUserService';
import { LEVELS } from '../constants';
import { translations } from '../translations';

interface LeaderboardProps {
  profile: UserProfile;
  supabaseUserId: string;
}

const LeaderboardView: React.FC<LeaderboardProps> = ({ profile, supabaseUserId }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const t = translations[profile.nativeLanguage].ranking;

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const [leaderboardData, points] = await Promise.all([
          supabaseUserService.getLeaderboard(50),
          supabaseUserService.getUserPoints(supabaseUserId)
        ]);
        
        setLeaderboard(leaderboardData);
        setUserPoints(points);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [supabaseUserId]);

  // Adicionar usuário atual se não estiver na lista
  const allUsers = React.useMemo(() => {
    const userInList = leaderboard.find(u => u.id === supabaseUserId);
    
    if (userInList) {
      return leaderboard;
    }
    
    // Adicionar usuário atual
    const currentUser: LeaderboardEntry = {
      id: supabaseUserId,
      name: profile.name,
      avatar_url: profile.avatar || null,
      current_level: profile.proficiency,
      points: userPoints
    };
    
    const combined = [...leaderboard, currentUser];
    return combined.sort((a, b) => b.points - a.points);
  }, [leaderboard, profile, userPoints, supabaseUserId]);

  if (loading) {
    return (
      <div className="p-6 pt-10 flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-10 pb-28 space-y-6 bg-[#f5f5f5] dark:bg-slate-900 min-h-screen">
      <header className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">{t.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t.subtitle}</p>
      </header>

      <div className="flex items-end justify-center space-x-2 pt-10 pb-6">
        {allUsers.slice(0, 3).map((u, i) => {
          const positions = [1, 0, 2];
          const user = allUsers[positions[i]];
          if (!user) return null;
          
          const isWinner = positions[i] === 0;
          const isThird = positions[i] === 2;
          const initial = user.name?.charAt(0) || '?';

          return (
            <div key={user.id} className="flex flex-col items-center space-y-3">
              <div className={`relative ${isWinner ? 'scale-110 -translate-y-4' : 'scale-90'}`}>
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name}
                    className={`w-16 h-16 rounded-full border-4 object-cover ${
                      isWinner ? 'border-amber-400' :
                      isThird ? 'border-orange-300' :
                      'border-slate-300'
                    }`}
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-xl font-bold ${
                    isWinner ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                    isThird ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' :
                    'border-slate-300 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {initial}
                  </div>
                )}
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold text-white ${
                  isWinner ? 'bg-amber-400' : isThird ? 'bg-orange-400' : 'bg-slate-400'
                }`}>
                  #{positions[i] + 1}
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 w-20 truncate">{user.name}</p>
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">{user.points} XP</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
        {allUsers.map((user, index) => {
          const isMe = user.id === supabaseUserId;
          const levelInfo = LEVELS.find(l => l.id === user.current_level);
          const initial = user.name?.charAt(0) || '?';
          
          return (
            <div 
              key={user.id} 
              className="flex items-center p-4 space-x-4 border-b border-slate-50 dark:border-slate-700 last:border-0"
            >
              <div className="w-6 text-center text-xs font-black text-slate-400 dark:text-slate-600">
                {index + 1}
              </div>
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold">
                  {initial}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className={`text-sm font-bold ${isMe ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {user.name} {isMe && `(${t.you})`}
                  </p>
                  {levelInfo && (
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${levelInfo.color}`}>
                      {levelInfo.label}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{t.globalRanking}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 dark:text-white">{user.points}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">XP</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaderboardView;
