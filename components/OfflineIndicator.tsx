import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 animate-in slide-in-from-top duration-300">
      <div className="mx-4 mt-4 bg-amber-500 dark:bg-amber-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center space-x-3">
        <WifiOff size={20} className="flex-shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-sm">Você está offline</p>
          <p className="text-xs opacity-90">Algumas funcionalidades podem não estar disponíveis</p>
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
