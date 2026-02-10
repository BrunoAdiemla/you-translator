import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface UpdateNotificationProps {
  onUpdate?: () => void;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onUpdate }) => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
    onUpdate?.();
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-emerald-600 dark:bg-emerald-700 text-white p-4 rounded-2xl shadow-xl flex items-center space-x-4">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0">
          <RefreshCw size={24} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">Nova versão disponível!</p>
          <p className="text-xs opacity-90">Atualize para ter acesso às últimas melhorias</p>
        </div>
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-white text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors"
        >
          Atualizar
        </button>
        <button
          onClick={handleDismiss}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default UpdateNotification;
