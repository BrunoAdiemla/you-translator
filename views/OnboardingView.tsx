
import React, { useState } from 'react';
import { Language, Difficulty, UserProfile } from '../types';
import { LANGUAGES, LEVELS } from '../constants';
import { storageService } from '../services/storageService';
import { supabaseUserService } from '../services/supabaseUserService';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { translations } from '../translations';
import Logo from '../components/Logo';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  prefilledName?: string;
  prefilledEmail?: string;
}

const OnboardingView: React.FC<OnboardingProps> = ({ onComplete, prefilledName, prefilledEmail }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(prefilledName || '');
  const [lang, setLang] = useState<Language>(Language.PORTUGUESE);
  const [level, setLevel] = useState<Difficulty>(Difficulty.BASIC);
  const [saving, setSaving] = useState(false);
  const t = translations[lang].onboarding;

  const handleNextStep = async () => {
    if (step === 1) {
      // Salvar first_name ao avançar da primeira tela
      if (!name.trim()) return alert("Por favor, digite como você deseja ser chamado");
      
      setSaving(true);
      try {
        const session = await supabaseAuthService.getSession();
        if (session) {
          await supabaseUserService.updateUserProfile(session.user.id, {
            first_name: name.trim(),
          });
        }
        setStep(2);
      } catch (error) {
        console.error('Error saving first_name:', error);
        alert('Erro ao salvar. Tente novamente.');
      } finally {
        setSaving(false);
      }
    } else if (step === 2) {
      // Salvar mother_language ao avançar da segunda tela
      setSaving(true);
      try {
        const session = await supabaseAuthService.getSession();
        if (session) {
          const languageMap: Record<Language, string> = {
            [Language.PORTUGUESE]: 'pt-BR',
            [Language.SPANISH]: 'es-ES',
            [Language.FRENCH]: 'fr-FR',
          };
          
          await supabaseUserService.updateUserProfile(session.user.id, {
            mother_language: languageMap[lang],
          });
        }
        setStep(3);
      } catch (error) {
        console.error('Error saving mother_language:', error);
        alert('Erro ao salvar. Tente novamente.');
      } finally {
        setSaving(false);
      }
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const session = await supabaseAuthService.getSession();
      
      if (session) {
        const levelMap: Record<Difficulty, string> = {
          [Difficulty.BASIC]: 'beginner',
          [Difficulty.INTERMEDIATE]: 'intermediate',
          [Difficulty.ADVANCED]: 'advanced',
        };

        // Atualizar current_level no Supabase (finalizando onboarding)
        await supabaseUserService.updateUserProfile(session.user.id, {
          current_level: levelMap[level],
        });
      }

      // Criar perfil local
      const profile = storageService.initializeDefault(name, prefilledEmail || '', lang, level);
      onComplete(profile);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Erro ao salvar dados. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mobile-container flex flex-col p-8 pt-16 bg-[#FAFAFA] dark:bg-slate-950 min-h-screen">
      <div className="flex-1">
        <div className="flex items-center justify-center mb-8">
          <Logo size="md" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 font-heading">
          {step === 1 ? t.welcome : step === 2 ? t.nativeLang : t.level}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
          {step === 1 ? t.startJourney : 
           step === 2 ? t.whichLang : 
           t.chooseLevel}
        </p>

        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Como você deseja ser chamado?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white transition-all"
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-right-4">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id as Language)}
                className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  lang === l.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{l.flag}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">{l.label}</span>
                </div>
                {lang === l.id && <div className="w-4 h-4 rounded-full bg-indigo-600"></div>}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-right-4">
            {LEVELS.map((lv) => (
              <button
                key={lv.id}
                onClick={() => setLevel(lv.id as Difficulty)}
                className={`p-5 rounded-2xl border-2 transition-all flex items-center space-x-5 ${
                  level === lv.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className={`p-3 rounded-xl ${lv.color} shadow-sm`}>
                  {lv.icon}
                </div>
                <div className="text-left">
                  <span className="font-black text-slate-800 dark:text-white block uppercase tracking-tight">{lv.label}</span>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {lv.id === 'Basic' ? (lang === Language.PORTUGUESE ? 'Frases simples' : lang === Language.SPANISH ? 'Frases simples' : 'Phrases simples') : 
                     lv.id === 'Intermediate' ? (lang === Language.PORTUGUESE ? 'Diálogos' : lang === Language.SPANISH ? 'Diálogos' : 'Dialogues') : 
                     (lang === Language.PORTUGUESE ? 'Complexo' : lang === Language.SPANISH ? 'Complejo' : 'Complexe')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleNextStep}
        disabled={saving}
        className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 dark:shadow-none transition-transform active:scale-95 mt-10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Salvando...</span>
          </div>
        ) : (
          step === 3 ? t.startNow : t.next
        )}
      </button>
    </div>
  );
};

export default OnboardingView;
