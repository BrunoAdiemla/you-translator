
import React, { useState } from 'react';
import { AuthSession, Language } from '../types';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { storageService } from '../services/storageService';
import { translations } from '../translations';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Github, Chrome, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

interface AuthViewProps {
  onAuthenticated: (session: AuthSession) => void;
  language: Language;
}

type AuthSubView = 'login' | 'signup' | 'forgot';

const AuthView: React.FC<AuthViewProps> = ({ onAuthenticated, language }) => {
  const [view, setView] = useState<AuthSubView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const t = translations[language].auth;

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateEmail(email)) return setError(t.errorEmail);
    if (password.length < 6) return setError(t.errorPassword);

    setLoading(true);
    try {
      const session = await supabaseAuthService.signIn(email, password);
      
      // Salvar sessão no localStorage também
      storageService.setAuthSession(session);
      
      onAuthenticated(session);
    } catch (err: any) {
      setError(err.message || t.errorLogin);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError(t.errorName);
    if (!validateEmail(email)) return setError(t.errorEmail);
    if (password.length < 6) return setError(t.errorPassword);

    setLoading(true);
    try {
      const session = await supabaseAuthService.signUp(email, password, name);
      
      // Salvar sessão no localStorage também
      storageService.setAuthSession(session);
      
      onAuthenticated(session);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return setError(t.errorEmail);
    
    setLoading(true);
    try {
      await supabaseAuthService.resetPassword(email);
      setSuccessMsg(t.successForgot);
      setTimeout(() => setView('login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email');
    } finally {
      setLoading(false);
    }
  };

  // Resetar campos e showPassword quando mudar de view
  React.useEffect(() => {
    setPassword('');
    setShowPassword(false);
    setError(null);
  }, [view]);

  return (
    <div className="mobile-container flex flex-col p-8 pt-16 bg-[#FAFAFA] dark:bg-slate-950 min-h-screen">
      <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <Logo size="lg" className="mb-6" />
        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-heading">
          {view === 'login' ? t.loginTitle : view === 'signup' ? t.signupTitle : t.forgotTitle}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          {view === 'login' ? t.loginSubtitle : view === 'signup' ? t.signupSubtitle : t.forgotSubtitle}
        </p>
      </header>

      <form 
        onSubmit={view === 'login' ? handleLogin : view === 'signup' ? handleSignup : handleForgot} 
        className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        {view === 'signup' && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t.nameLabel}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t.emailLabel}</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {view !== 'forgot' && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.passwordLabel}</label>
              {view === 'login' && (
                <button type="button" onClick={() => setView('forgot')} className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {t.forgotLink}
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center space-x-3 text-sm font-bold border border-rose-100 dark:border-rose-900/30 animate-in shake duration-300">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center space-x-3 text-sm font-bold border border-emerald-100 dark:border-emerald-900/30">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none active:scale-[0.98] transition-all flex items-center justify-center space-x-2 mt-4"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>{view === 'login' ? t.loginBtn : view === 'signup' ? t.signupBtn : t.forgotBtn}</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center space-y-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.or}</span>
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center space-x-2 py-3 bg-[#FAFAFA] dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 active:scale-95 transition-all">
            <Chrome size={18} className="text-indigo-600" />
            <span>Google</span>
          </button>
          <button className="flex items-center justify-center space-x-2 py-3 bg-[#FAFAFA] dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 active:scale-95 transition-all">
            <Github size={18} className="text-slate-900 dark:text-white" />
            <span>GitHub</span>
          </button>
        </div>

        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {view === 'login' ? (
            <>
              {t.noAccount}
              <button onClick={() => setView('signup')} className="text-indigo-600 dark:text-indigo-400 font-bold underline underline-offset-4">
                {t.signupBtn}
              </button>
            </>
          ) : (
            <>
              {t.haveAccount}
              <button onClick={() => setView('login')} className="text-indigo-600 dark:text-indigo-400 font-bold underline underline-offset-4">
                {t.loginBtn}
              </button>
            </>
          )}
        </p>

        {view === 'forgot' && (
          <button onClick={() => setView('login')} className="flex items-center justify-center space-x-2 mx-auto text-sm font-bold text-slate-400 dark:text-slate-600">
            <ArrowLeft size={16} />
            <span>{t.backToLogin}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthView;
