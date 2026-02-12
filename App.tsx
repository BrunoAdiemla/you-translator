
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { storageService } from './services/storageService';
import { supabaseAuthService } from './services/supabaseAuthService';
import { supabaseUserService } from './services/supabaseUserService';
import { UserProfile, Language, AuthSession, Difficulty } from './types';
import { ICONS } from './constants';
import { translations } from './translations';
import OfflineIndicator from './components/OfflineIndicator';
import UpdateNotification from './components/UpdateNotification';

// View components
import OnboardingView from './views/OnboardingView';
import HomeView from './views/HomeView';
import PracticeView from './views/PracticeView';
import LeaderboardView from './views/LeaderboardView';
import ProfileView from './views/ProfileView';
import HistoryListView from './views/HistoryListView';
import HistoryDetailView from './views/HistoryDetailView';
import AuthView from './views/AuthView';

const NavigationBar: React.FC<{ language: Language }> = ({ language }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language].nav;

  const navItems = [
    { path: '/', label: t.home, icon: ICONS.Home },
    { path: '/practice', label: t.practice, icon: ICONS.Practice },
    { path: '/history', label: t.history, icon: ICONS.History },
    { path: '/ranking', label: t.ranking, icon: ICONS.Ranking },
    { path: '/profile', label: t.profile, icon: ICONS.Profile },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 px-2 z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/history' && location.pathname.startsWith('/history/'));
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors flex-1 ${
              isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'
            }`}
          >
            <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-tight truncate w-full text-center">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

const AppContent: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Verificar sessão do Supabase
        const supabaseSession = await supabaseAuthService.getSession();
        
        if (supabaseSession) {
          setSession(supabaseSession);
          
          // Buscar dados do usuário no Supabase
          const supabaseUser = await supabaseUserService.getUserById(supabaseSession.user.id);
          
          if (supabaseUser) {
            // Verificar se precisa fazer onboarding
            // Usuário precisa de onboarding se qualquer um dos campos estiver vazio
            const needsOnboardingCheck = 
              !supabaseUser.first_name || 
              !supabaseUser.mother_language || 
              !supabaseUser.current_level;
            
            if (needsOnboardingCheck) {
              setNeedsOnboarding(true);
              setProfile(null);
            } else {
              // Usuário já completou onboarding
              let userProfile = storageService.getProfile();
              
              // Se não existe perfil local, criar a partir dos dados do Supabase
              if (!userProfile) {
                // Mapear mother_language para Language enum
                const languageMap: Record<string, Language> = {
                  'pt-BR': Language.PORTUGUESE,
                  'es-ES': Language.SPANISH,
                  'fr-FR': Language.FRENCH,
                };
                
                // Mapear current_level para Difficulty enum
                const levelMap: Record<string, Difficulty> = {
                  'beginner': Difficulty.BASIC,
                  'intermediate': Difficulty.INTERMEDIATE,
                  'advanced': Difficulty.ADVANCED,
                };
                
                const lang = languageMap[supabaseUser.mother_language || 'pt-BR'] || Language.PORTUGUESE;
                const level = levelMap[supabaseUser.current_level || 'beginner'] || Difficulty.BASIC;
                
                userProfile = storageService.initializeDefault(
                  supabaseUser.first_name || supabaseUser.name,
                  supabaseUser.email,
                  lang,
                  level
                );
              }
              
              setProfile(userProfile);
              setNeedsOnboarding(false);
            }
          }
        } else {
          // Fallback para sessão local (caso exista)
          const localSession = storageService.getAuthSession();
          setSession(localSession);
          if (localSession) {
            const userProfile = storageService.getProfile();
            setProfile(userProfile);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listener para mudanças de autenticação
    const { data: authListener } = supabaseAuthService.onAuthStateChange((newSession) => {
      setSession(newSession);
      if (!newSession) {
        setProfile(null);
        setNeedsOnboarding(false);
        storageService.clearAuthSession();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Carregando...</p>
      </div>
    </div>
  );

  // Flow: Auth -> Onboarding -> Main App
  if (!session) {
    return <AuthView onAuthenticated={async (s) => { 
      setLoading(true);
      setSession(s);
      
      // Buscar dados do usuário após autenticação
      try {
        const supabaseUser = await supabaseUserService.getUserById(s.user.id);
        
        if (supabaseUser) {
          const needsOnboardingCheck = 
            !supabaseUser.first_name || 
            !supabaseUser.mother_language || 
            !supabaseUser.current_level;
          
          if (needsOnboardingCheck) {
            setNeedsOnboarding(true);
            setProfile(null);
          } else {
            // Criar perfil a partir dos dados do Supabase
            const languageMap: Record<string, Language> = {
              'pt-BR': Language.PORTUGUESE,
              'es-ES': Language.SPANISH,
              'fr-FR': Language.FRENCH,
            };
            
            const levelMap: Record<string, Difficulty> = {
              'beginner': Difficulty.BASIC,
              'intermediate': Difficulty.INTERMEDIATE,
              'advanced': Difficulty.ADVANCED,
            };
            
            const lang = languageMap[supabaseUser.mother_language || 'pt-BR'] || Language.PORTUGUESE;
            const level = levelMap[supabaseUser.current_level || 'beginner'] || Difficulty.BASIC;
            
            const userProfile = storageService.initializeDefault(
              supabaseUser.first_name || supabaseUser.name,
              supabaseUser.email,
              lang,
              level
            );
            
            setProfile(userProfile);
            setNeedsOnboarding(false);
          }
        }
      } catch (error) {
        console.error('Error fetching user after login:', error);
      } finally {
        setLoading(false);
      }
    }} language={Language.PORTUGUESE} />;
  }

  if (needsOnboarding || !profile) {
    return (
      <OnboardingView 
        onComplete={(p) => { 
          setProfile(p);
          setNeedsOnboarding(false);
          navigate('/'); 
        }} 
        prefilledName={session.user.name}
        prefilledEmail={session.user.email}
      />
    );
  }

  return (
    <div className={`${profile.theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 min-h-screen`}>
      <div className="mobile-container relative pb-20 overflow-x-hidden bg-[#f5f5f5] dark:bg-slate-900 min-h-screen">
        <Routes>
          <Route path="/" element={<HomeView profile={profile} supabaseUserId={session.user.id} />} />
          <Route path="/practice" element={<PracticeView profile={profile} onUpdateProfile={setProfile} />} />
          <Route path="/history" element={<HistoryListView profile={profile} />} />
          <Route path="/history/:id" element={<HistoryDetailView profile={profile} />} />
          <Route path="/ranking" element={<LeaderboardView profile={profile} supabaseUserId={session.user.id} />} />
          <Route path="/profile" element={<ProfileView profile={profile} onUpdateProfile={setProfile} supabaseUserId={session.user.id} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <NavigationBar language={profile.nativeLanguage} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <OfflineIndicator />
      <UpdateNotification />
      <AppContent />
    </HashRouter>
  );
}
