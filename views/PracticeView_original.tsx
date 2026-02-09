
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, EvaluationResult } from '../types';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { ICONS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { translations } from '../translations';
import { Bot, Sparkles } from 'lucide-react';

interface PracticeProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

const PracticeView: React.FC<PracticeProps> = ({ profile, onUpdateProfile }) => {
  const [loading, setLoading] = useState(true);
  const [original, setOriginal] = useState('');
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const t = translations[profile.nativeLanguage].practice;

  const fetchNewPhrase = useCallback(async () => {
    setLoading(true);
    setEvaluation(null);
    setAnswer('');
    try {
      const phrase = await geminiService.generatePhrase(profile.nativeLanguage, profile.proficiency);
      setOriginal(phrase);
    } catch (e) {
      setOriginal(t.error);
    } finally {
      setLoading(false);
    }
  }, [profile, t.error]);

  useEffect(() => {
    fetchNewPhrase();
  }, [fetchNewPhrase]);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      const res = await geminiService.evaluateTranslation(
        original, 
        answer, 
        profile.proficiency,
        profile.nativeLanguage
      );
      setEvaluation(res);
      
      const updatedProfile = storageService.updateProfileStats(res.score);
      onUpdateProfile(updatedProfile);
      
      storageService.saveAttempt({
        id: Math.random().toString(36),
        exerciseId: 'ex-01',
        userId: profile.id,
        userTranslation: answer,
        evaluation: res,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      alert(t.evalError);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 dark:text-slate-400 font-medium">{t.generating}</p>
    </div>
  );

  return (
    <div className="p-6 pt-10 pb-24 space-y-6 bg-white dark:bg-slate-900 min-h-screen">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/')} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 w-1/3 transition-all duration-500"></div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t.translateThis}</p>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 leading-relaxed font-heading">
            {original}
          </h2>
        </div>

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
              disabled={submitting || !answer.trim()}
              className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 ${
                submitting || !answer.trim() ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-indigo-100 active:scale-95'
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
              onClick={fetchNewPhrase}
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
