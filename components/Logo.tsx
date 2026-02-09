import React from 'react';
import { Languages } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', container: 'space-x-2' },
    md: { icon: 'w-12 h-12', text: 'text-2xl', container: 'space-x-3' },
    lg: { icon: 'w-16 h-16', text: 'text-3xl', container: 'space-x-4' },
  };

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 36,
  };

  return (
    <div className={`flex items-center ${sizeClasses[size].container} ${className}`}>
      <div className={`${sizeClasses[size].icon} bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none`}>
        <Languages size={iconSizes[size]} strokeWidth={2.5} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${sizeClasses[size].text} font-black text-slate-900 dark:text-white font-heading leading-none`}>
            You Translator
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
