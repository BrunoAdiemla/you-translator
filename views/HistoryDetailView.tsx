
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { supabaseTranslationService, Translation } from '../services/supabaseTranslationService';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { cacheService } from '../services/cacheService';
import { translations } from '../translations';
import { ArrowLeft, Bot, Sparkles, Quote } from 'lucide-react';

interface HistoryDetailProps {
  profile: UserProfile;
}

const HistoryDetailView: React.FC<HistoryDetailProps> = ({ profile }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const t = translations[profile.nativeLanguage].history;
  const tp = translations[profile.nativeLanguage].practice;

  useEffect(() => {
    const loadTranslation = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await supabaseTranslationService.getTranslationById(id);
        setTranslation(data);
      } catch (error) {
        console.error('Error loading translation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTranslation();
  }, [id]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!translation?.id) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    const success = await supabaseTranslationService.deleteTranslation(translation.id);
    
    if (success) {
      // Invalidar cache de estatísticas após excluir tradução
      const session = await supabaseAuthService.getSession();
      if (session?.user) {
        cacheService.remove(`user_points_${session.user.id}`);
        cacheService.remove(`user_stats_${session.user.id}`);
      }
      
      navigate('/history');
    } else {
      setDeleteError(t.deleteError);
      setIsDeleting(false);
    }
  };

  // Delete Confirmation Modal Component
  const DeleteConfirmationModal = () => {
    if (!showDeleteModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md bg-[#FAFAFA] dark:bg-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
            {t.deleteModalTitle}
          </h3>
          
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.deleteModalMessage}
          </p>

          {deleteError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancelDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.deleteCancelBtn}
            </button>
            
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isDeleting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                t.deleteConfirmBtn
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 pt-10 flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!translation) {
    return (
      <div className="p-6 pt-10 flex flex-col items-center justify-center min-h-screen text-center space-y-4">
        <p className="text-slate-500">Tradução não encontrada.</p>
        <button onClick={() => navigate('/history')} className="text-indigo-600 font-bold">Voltar</button>
      </div>
    );
  }

  return (
    <div className="p-6 pt-10 pb-28 space-y-6 bg-[#f5f5f5] dark:bg-slate-900 min-h-screen">
      <header className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/history')}
          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 active:scale-90 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white font-heading">{t.detailTitle}</h1>
      </header>

      <div className="space-y-6">
        {/* original phrase */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{tp.translateThis}</p>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 leading-relaxed font-heading">
            {translation.original_phrase}
          </h2>
        </div>

        {/* User's Work */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">{t.yourTranslation}</label>
          <div className="w-full p-5 bg-[#e6e6fa] dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl text-slate-700 dark:text-slate-300 font-medium">
            <Quote size={16} className="text-indigo-400 mb-2" />
            <p className="text-lg italic">{translation.user_translation}</p>
          </div>
        </div>

        {/* AI feedback section */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 px-1">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Bot size={20} />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{tp.result}</span>
          </div>
          
          <div className="relative group">
            <div className="absolute -top-3 right-4 px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg z-10">
              AI Review
            </div>
            <div className="w-full min-h-[160px] p-5 bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-3xl shadow-sm space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Sparkles size={14} className="text-amber-500" />
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{tp.correction}</p>
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-bold text-lg italic bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  {translation.correct_translation}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {translation.explanation}
                </p>
                <div className="pt-2 flex justify-end">
                   <span className={`px-3 py-1 rounded-lg font-black text-sm ${translation.score >= 7 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                     {t.score} {translation.score}/10
                   </span>
                </div>
              </div>

              {translation.tips.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{tp.tips}</p>
                  <ul className="space-y-1">
                    {translation.tips.map((tip, i) => (
                      <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start space-x-2">
                        <span className="text-indigo-500">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <div className="pt-4">
          <button
            onClick={handleDeleteClick}
            className="w-full px-6 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 rounded-3xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-95 transition-all"
          >
            {t.deleteBtn}
          </button>
        </div>
      </div>

      {/* Render Delete Confirmation Modal */}
      <DeleteConfirmationModal />
    </div>
  );
};

export default HistoryDetailView;

