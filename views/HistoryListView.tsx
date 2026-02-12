
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabaseTranslationService, Translation } from '../services/supabaseTranslationService';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { useNavigate } from 'react-router-dom';
import { translations } from '../translations';
import { ChevronRight, Calendar } from 'lucide-react';

interface HistoryListProps {
  profile: UserProfile;
}

const HistoryListView: React.FC<HistoryListProps> = ({ profile }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[profile.nativeLanguage].history;

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const session = await supabaseAuthService.getSession();
        if (session?.user) {
          const translations = await supabaseTranslationService.getUserTranslations(session.user.id);
          setHistory(translations);
        }
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="p-6 pt-10 pb-28 space-y-6 bg-[#f5f5f5] dark:bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-10 pb-28 space-y-6 bg-[#f5f5f5] dark:bg-slate-900 min-h-screen">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">{t.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t.subtitle}</p>
      </header>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-300 dark:text-slate-700">
            <Calendar size={48} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium px-10">
            {t.empty}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((translation) => (
            <button
              key={translation.id}
              onClick={() => navigate(`/history/${translation.id}`)}
              className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center space-x-4 shadow-sm active:scale-[0.98] transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                translation.score >= 8 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                : translation.score >= 5
                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
              }`}>
                {translation.score}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate uppercase tracking-tight">
                  {translation.user_translation}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase mt-0.5">
                  {new Date(translation.created_at).toLocaleDateString()} • {new Date(translation.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryListView;

