import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onInstall, onDismiss }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      onInstall?.();
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onDismiss?.();
  };

  if (!showPrompt) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-lg flex items-center space-x-4 animate-in slide-in-from-bottom duration-300">
      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0">
        <Download size={24} />
      </div>
      <div className="flex-1">
        <p className="font-bold text-sm">Instalar You Translator</p>
        <p className="text-xs opacity-90">Acesse mais rápido instalando o app</p>
      </div>
      <button
        onClick={handleInstall}
        className="px-4 py-2 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors"
      >
        Instalar
      </button>
      <button
        onClick={handleDismiss}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Fechar"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default InstallPrompt;
