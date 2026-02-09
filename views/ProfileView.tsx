
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Language, Difficulty, ThemeMode } from '../types';
import { LEVELS, LANGUAGES } from '../constants';
import { Moon, Sun, ChevronRight, User, Settings, CreditCard, ArrowLeft, Save, Check, Camera, Upload } from 'lucide-react';
import { translations } from '../translations';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { supabaseUserService } from '../services/supabaseUserService';
import { storageService } from '../services/storageService';
import { cacheService } from '../services/cacheService';

interface ProfileProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  supabaseUserId: string;
}

type ProfileSubView = 'main' | 'preferences' | 'userdata' | 'subscription';

const ProfileView: React.FC<ProfileProps> = ({ profile, onUpdateProfile, supabaseUserId }) => {
  const [subView, setSubView] = useState<ProfileSubView>('main');
  const [editName, setEditName] = useState(profile.name);
  const [editFirstName, setEditFirstName] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | undefined>(profile.avatar);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userPoints, setUserPoints] = useState(profile.points);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentLevel = LEVELS.find(l => l.id === profile.proficiency);
  const t = translations[profile.nativeLanguage].profile;

  useEffect(() => {
    setEditName(profile.name);
    setEditAvatar(profile.avatar);
  }, [profile.name, profile.avatar]);

  useEffect(() => {
    const loadUserData = async () => {
      // Tentar buscar do cache primeiro
      const cacheKey = `user_avatar_${supabaseUserId}`;
      const cachedAvatar = cacheService.get<string>(cacheKey);
      
      if (cachedAvatar) {
        setAvatarUrl(cachedAvatar);
        setEditAvatar(cachedAvatar);
      }

      // Buscar pontos do usuário
      const points = await supabaseUserService.getUserPoints(supabaseUserId);
      setUserPoints(points);

      // Buscar avatar e first_name do usuário (sempre busca para atualizar o cache)
      const userData = await supabaseUserService.getUserById(supabaseUserId);
      if (userData?.avatar_url) {
        setAvatarUrl(userData.avatar_url);
        setEditAvatar(userData.avatar_url);
        // Armazenar no cache por 10 minutos
        cacheService.set(cacheKey, userData.avatar_url, 10 * 60 * 1000);
      }
      if (userData?.first_name) {
        setEditFirstName(userData.first_name);
      }
    };

    loadUserData();
  }, [supabaseUserId]);

  const handleLevelChange = (newLevel: Difficulty) => {
    const updated = { ...profile, proficiency: newLevel };
    onUpdateProfile(updated);
    localStorage.setItem('you_translator_profile', JSON.stringify(updated));
  };

  const handleLanguageChange = (newLang: Language) => {
    const updated = { ...profile, nativeLanguage: newLang };
    onUpdateProfile(updated);
    localStorage.setItem('you_translator_profile', JSON.stringify(updated));
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    const updated = { ...profile, theme: newTheme };
    onUpdateProfile(updated);
    localStorage.setItem('you_translator_profile', JSON.stringify(updated));
  };

  const handleSaveUserData = async () => {
    if (!editName.trim()) return;
    
    // Atualizar first_name no Supabase
    if (editFirstName.trim()) {
      await supabaseUserService.updateUserProfile(supabaseUserId, {
        first_name: editFirstName.trim()
      });
    }
    
    const updated = { ...profile, name: editName, avatar: editAvatar };
    onUpdateProfile(updated);
    localStorage.setItem('you_translator_profile', JSON.stringify(updated));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Upload para o Supabase Storage
      const uploadedAvatarUrl = await supabaseUserService.uploadAvatar(supabaseUserId, file);

      if (uploadedAvatarUrl) {
        // Atualizar preview local e estado
        setEditAvatar(uploadedAvatarUrl);
        setAvatarUrl(uploadedAvatarUrl);
        
        // Atualizar cache
        const cacheKey = `user_avatar_${supabaseUserId}`;
        cacheService.set(cacheKey, uploadedAvatarUrl, 10 * 60 * 1000);
        
        // Atualizar profile
        const updated = { ...profile, avatar: uploadedAvatarUrl };
        onUpdateProfile(updated);
        localStorage.setItem('you_translator_profile', JSON.stringify(updated));
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert('Erro ao fazer upload da imagem. Tente novamente.');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabaseAuthService.signOut();
      storageService.clearAuthSession();
      localStorage.removeItem('you_translator_profile');
      
      // Limpar cache do avatar ao fazer logout
      cacheService.remove(`user_avatar_${supabaseUserId}`);
      
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout. Tente novamente.');
    }
  };

  const ProfileHeaderImage = ({ size = 'lg' }: { size?: 'lg' | 'sm' }) => {
    const containerClasses = size === 'lg' 
      ? "w-24 h-24 rounded-full shadow-xl" 
      : "w-12 h-12 rounded-full";
    const textClasses = size === 'lg' ? "text-4xl" : "text-xl";

    if (avatarUrl) {
      return (
        <img 
          src={avatarUrl} 
          alt={profile.name} 
          className={`${containerClasses} object-cover border-2 border-indigo-100 dark:border-indigo-900`} 
        />
      );
    }

    return (
      <div className={`${containerClasses} bg-indigo-600 dark:bg-indigo-700 flex items-center justify-center text-white ${textClasses} font-black shadow-indigo-100 dark:shadow-none`}>
        {profile.name.charAt(0)}
      </div>
    );
  };

  const renderMainView = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
      <header className="flex flex-col items-center space-y-4">
        <div className="relative">
          <ProfileHeaderImage size="lg" />
          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-lg border border-slate-100 dark:border-slate-700">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">{profile.name}</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">{t.student} • {currentLevel?.label}</p>
        </div>
      </header>

      <div className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-6 grid grid-cols-3 gap-4 border border-slate-100 dark:border-slate-700">
        <div className="text-center space-y-1">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.xp}</p>
          <p className="text-lg font-black text-slate-900 dark:text-white">{userPoints}</p>
        </div>
        <div className="text-center space-y-1 border-x border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.avg}</p>
          <p className="text-lg font-black text-slate-900 dark:text-white">{profile.averageScore}</p>
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.streak}</p>
          <p className="text-lg font-black text-slate-900 dark:text-white">{profile.streak}d</p>
        </div>
      </div>

      <nav className="space-y-3">
        <button 
          onClick={() => setSubView('userdata')}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm active:scale-[0.98] transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <User size={20} />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">{t.userData}</span>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

        <button 
          onClick={() => setSubView('preferences')}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm active:scale-[0.98] transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
              <Settings size={20} />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">{t.preferences}</span>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

        <button 
          onClick={() => setSubView('subscription')}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm active:scale-[0.98] transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CreditCard size={20} />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">{t.subscription}</span>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>
      </nav>

      <button
        onClick={handleLogout}
        className="w-full py-4 text-rose-500 font-bold border-2 border-rose-100 dark:border-rose-900/30 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
      >
        {t.logout}
      </button>

      <footer className="text-center pb-8">
        <p className="text-[10px] text-slate-300 dark:text-slate-600 font-medium tracking-widest uppercase">You Translator {t.version} 1.0.0</p>
      </footer>
    </div>
  );

  const renderUserDataView = () => (
    <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-8">
      <header className="flex items-center space-x-4">
        <button 
          onClick={() => setSubView('main')}
          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 active:scale-90 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white font-heading">{t.userData}</h1>
      </header>

      <div className="space-y-6">
        {/* Avatar Upload Section */}
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-md">
              {editAvatar ? (
                <img src={editAvatar} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <User size={48} />
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploadingAvatar ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Camera size={20} />
              )}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
              disabled={isUploadingAvatar}
            />
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center space-x-2 disabled:opacity-50"
          >
            <Upload size={16} />
            <span>{isUploadingAvatar ? 'Enviando...' : t.uploadPhoto}</span>
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">{t.firstNameLabel}</label>
          <input 
            type="text"
            value={editFirstName}
            onChange={(e) => setEditFirstName(e.target.value)}
            placeholder={t.firstNameLabel}
            className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">{t.nameLabel}</label>
          <input 
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 font-medium"
          />
        </div>

        <div className="space-y-2 opacity-60">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">{t.emailLabel}</label>
          <input 
            type="email"
            value={profile.email || `${profile.name.toLowerCase().replace(/\s/g, '.')}@example.com`}
            disabled
            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-500 font-medium cursor-not-allowed"
          />
        </div>

        <button 
          onClick={handleSaveUserData}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
        >
          <Save size={18} />
          <span>{t.saveBtn}</span>
        </button>

        {showSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center space-x-3 text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-top-2">
            <Check size={18} />
            <span className="text-sm font-bold">{t.updateSuccess}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderPreferencesView = () => (
    <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-8">
      <header className="flex items-center space-x-4">
        <button 
          onClick={() => setSubView('main')}
          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 active:scale-90 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white font-heading">{t.preferences}</h1>
      </header>

      <section className="space-y-6">
        {/* Appearance Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white px-1">{t.appearance}</h3>
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl flex">
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                profile.theme === 'light' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <Sun size={14} />
              <span>{t.light}</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                profile.theme === 'dark' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <Moon size={14} />
              <span>{t.dark}</span>
            </button>
          </div>
        </div>

        {/* Learning Settings Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white px-1">{t.learningSettings}</h3>
          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl space-y-3 shadow-sm">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.difficulty}</label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((lv) => (
                <button
                  key={lv.id}
                  onClick={() => handleLevelChange(lv.id as Difficulty)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all border-2 ${
                    profile.proficiency === lv.id 
                    ? 'bg-indigo-600 text-white border-indigo-600 dark:border-indigo-500' 
                    : 'bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-600'
                  }`}
                >
                  {lv.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Languages Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white px-1">{t.languages}</h3>
          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl space-y-3 shadow-sm">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.nativeLanguage}</label>
            <div className="grid grid-cols-1 gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleLanguageChange(l.id as Language)}
                  className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all border-2 ${
                    profile.nativeLanguage === l.id 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-400' 
                    : 'bg-white dark:bg-slate-700 border-slate-100 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{l.flag}</span>
                    <span className="text-sm font-bold uppercase tracking-tight">{l.label}</span>
                  </div>
                  {profile.nativeLanguage === l.id && (
                    <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderPlaceholderView = (title: string) => (
    <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-8">
      <header className="flex items-center space-x-4">
        <button 
          onClick={() => setSubView('main')}
          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 active:scale-90 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white font-heading">{title}</h1>
      </header>
      <div className="py-20 text-center">
        <div className="inline-flex p-6 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-300 dark:text-slate-600 mb-4">
          <Settings size={48} />
        </div>
        <p className="text-slate-400 dark:text-slate-500">Recurso em desenvolvimento...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 pt-10 pb-20 bg-white dark:bg-slate-900 min-h-screen">
      {subView === 'main' && renderMainView()}
      {subView === 'preferences' && renderPreferencesView()}
      {subView === 'userdata' && renderUserDataView()}
      {subView === 'subscription' && renderPlaceholderView(t.subscription)}
    </div>
  );
};

export default ProfileView;
