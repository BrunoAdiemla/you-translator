
import React, { useState, useCallback } from 'react';
import { UserProfile, EvaluationResult } from '../types';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { supabaseTranslationService } from '../services/supabaseTranslationService';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { cacheService } from '../services/cacheService';
import { ICONS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { translations } from '../translations';
import { Bot, Sparkles, Pencil } from 'lucide-react';

interface PracticeProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

type PracticeMode = 'selection' | 'auto' | 'manual';

const PracticeView: React.FC<PracticeProps> = ({ profile, onUpdateProfile }) => {
  const [mode, setMode] = useState<PracticeMode>('selection');
  const [loading, setLoading] = useState(false);
  const [original, setOriginal] = useState('');
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showStartButton, setShowStartButton] = useState(true);
  const navigate = useNavigate();
  const t = translations[profile.nativeLanguage].practice;

  const fetchNewPhrase = useCallback(async () => {
    setLoading(true);
    setEvaluation(null);
    setAnswer('');
    setShowStartButton(false);
    try {
      const phrase = await geminiService.generatePhrase(profile.nativeLanguage, profile.proficiency);
      setOriginal(phrase);
    } catch (e) {
      setOriginal(t.error);
    } finally {
      setLoading(false);
    }
  }, [profile, t.error]);

  const handleModeSelection = (selectedMode: 'auto' | 'manual') => {
    setMode(selectedMode);
    if (selectedMode === 'manual') {
      setShowStartButton(false);
      setOriginal('');
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    if (mode === 'manual' && !original.trim()) {
      alert('Por favor, escreva a frase a ser traduzida primeiro.');
      return;
    }
    setSubmitting(true);
    try {
      console.log('1. Iniciando avaliação...');
      const res = await geminiService.evaluateTranslation(
        original, 
        answer, 
        profile.proficiency,
        profile.nativeLanguage
      );
      console.log('2. Avaliação recebida:', res);
      setEvaluation(res);
      
      console.log('3. Atualizando perfil...');
      const updatedProfile = storageService.updateProfileStats(res.score);
      onUpdateProfile(updatedProfile);
      
      console.log('4. Buscando sessão do usuário...');
      // Pegar o ID do usuário autenticado no Supabase
      const session = await supabaseAuthService.getSession();
      console.log('5. Sessão encontrada:', session);
      
      if (session?.user) {
        console.log('6. Salvando no Supabase...');
        const saved = await supabaseTranslationService.saveTranslation({
          userId: session.user.id,
          originalPhrase: original,
          userTranslation: answer,
          evaluation: res,
          practiceMode: mode === 'auto' ? 'auto' : 'manual',
          sourceLanguage: profile.nativeLanguage,
          difficultyLevel: profile.proficiency
        });
        console.log('7. Salvo no Supabase:', saved);
        
        // Invalidar cache de estatísticas após salvar nova tradução
        if (saved) {
          cacheService.remove(`user_points_${session.user.id}`);
          cacheService.remove(`user_stats_${session.user.id}`);
        }
      }

      console.log('8. Salvando no localStorage...');
      // Manter salvamento no localStorage para compatibilidade
      storageService.saveAttempt({
        id: Math.random().toString(36),
        exerciseId: 'ex-01',
        userId: profile.id,
        userTranslation: answer,
        evaluation: res,
        timestamp: new Date().toISOString()
      });
      console.log('9. Concluído com sucesso!');
    } catch (e) {
      console.error('ERRO COMPLETO:', e);
      alert(t.evalError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextPhrase = () => {
    if (mode === 'auto') {
      setShowStartButton(true);
    }
    setOriginal('');
    setAnswer('');
    setEvaluation(null);
  };

  const handleBackToSelection = () => {
    setMode('selection');
    setShowStartButton(true);
    setOriginal('');
    setAnswer('');
    setEvaluation(null);
  };

  // Tela de seleção de modo
  if (mode === 'selection') return (
    <div className="h-screen bg-[#f5f5f5] dark:bg-slate-900 flex flex-col items-center justify-center p-8 text-center space-y-8">
      <button onClick={() => navigate('/')} className="absolute top-6 left-6 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      
      <div className="space-y-4 max-w-md">
        <div className="w-20 h-20 mx-auto bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
          <Sparkles size={40} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t.modeSelectionTitle}</h2>
        <p className="text-slate-600 dark:text-slate-400">{t.modeSelectionSubtitle}</p>
      </div>
      
      <div className="w-full max-w-md space-y-4">
        <button
          onClick={() => handleModeSelection('auto')}
          className="w-full p-6 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all active:scale-95 flex items-center space-x-4"
        >
          <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Bot size={28} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-left flex-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t.autoModeTitle}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t.autoModeDesc}</p>
          </div>
        </button>

        <button
          onClick={() => handleModeSelection('manual')}
          className="w-full p-6 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all active:scale-95 flex items-center space-x-4"
        >
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Pencil size={28} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-left flex-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t.manualModeTitle}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t.manualModeDesc}</p>
          </div>
        </button>
      </div>
    </div>
  );

  // Tela de "Gerar Frase" (modo automático)
  if (mode === 'auto' && showStartButton) return (
    <div className="h-screen bg-[#f5f5f5] dark:bg-slate-900 flex flex-col items-center justify-center p-8 text-center space-y-6">
      <button onClick={handleBackToSelection} className="absolute top-6 left-6 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      
      <div className="space-y-4 max-w-md">
        <div className="w-20 h-20 mx-auto bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
          <Sparkles size={40} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t.readyTitle}</h2>
        <p className="text-slate-600 dark:text-slate-400">{t.readySubtitle}</p>
      </div>
      
      <button
        onClick={fetchNewPhrase}
        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all flex items-center space-x-2"
      >
        <span>{t.generateBtn}</span>
        <Sparkles size={20} />
      </button>
    </div>
  );

  if (loading) return (
    <div className="h-screen bg-[#f5f5f5] dark:bg-slate-900 flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 dark:text-slate-400 font-medium">{t.generating}</p>
    </div>
  );

  return (
    <div className="p-6 pt-10 pb-28 space-y-6 bg-[#f5f5f5] dark:bg-slate-900 min-h-screen">
      <div className="flex items-center space-x-4">
        <button onClick={handleBackToSelection} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 w-1/3 transition-all duration-500"></div>
        </div>
      </div>

      <section className="space-y-4">
        {mode === 'manual' ? (
          <div className="space-y-4">
            <textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder={t.manualPlaceholder}
              disabled={evaluation !== null}
              className="w-full h-40 p-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl outline-none focus:border-indigo-500 transition-colors resize-none text-lg text-slate-700 dark:text-slate-300 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        ) : (
          <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t.translateThis}</p>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 leading-relaxed font-heading">
              {original}
            </h2>
          </div>
        )}

        {!evaluation ? (
          <div className="space-y-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t.placeholder}
              className="w-full h-40 p-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl outline-none focus:border-indigo-500 transition-colors resize-none text-lg text-slate-700 dark:text-slate-300 font-medium"
            />
            <button
              onClick={handleSubmit}
              disabled={submitting || !answer.trim() || (mode === 'manual' && !original.trim())}
              className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 ${
                submitting || !answer.trim() || (mode === 'manual' && !original.trim()) ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-indigo-100 active:scale-95'
              }`}
            >
              {submitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{t.sendAnswer}</span>
                  {ICONS.Next}
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            {/* Mostrar o input da tradução do usuário (desabilitado) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Sua Tradução:</label>
              <textarea
                value={answer}
                disabled
                className="w-full h-32 p-5 bg-[#e6e6fa] dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-3xl resize-none text-lg text-slate-700 dark:text-slate-300 font-medium opacity-80 cursor-not-allowed"
              />
            </div>

            {/* Multiline Input style Feedback Container */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Bot size={20} />
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t.result}</span>
              </div>
              
              <div className="relative group">
                <div className="absolute -top-3 right-4 px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg z-10">
                  AI Feedback
                </div>
                <div className="w-full min-h-[160px] p-5 bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-3xl shadow-sm space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Sparkles size={14} className="text-amber-500" />
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.correction}</p>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-bold text-lg italic bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      {evaluation.correction}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {evaluation.explanation}
                    </p>
                    <div className="pt-2 flex justify-end">
                       <span className={`px-3 py-1 rounded-lg font-black text-sm ${evaluation.score >= 7 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                         Nota: {evaluation.score}/10
                       </span>
                    </div>
                  </div>

                  {evaluation.tips.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t.tips}</p>
                      <ul className="space-y-1">
                        {evaluation.tips.map((tip, i) => (
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

            <button
              onClick={handleNextPhrase}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>{t.next}</span>
              <Sparkles size={18} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default PracticeView;
