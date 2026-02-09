
import React from 'react';
import { 
  Home, 
  BookOpen, 
  Trophy, 
  User, 
  Star, 
  Zap, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  List
} from 'lucide-react';

export const UI_COLORS = {
  primary: '#4F46E5', // Indigo 600
  secondary: '#F59E0B', // Amber 500
  success: '#10B981', // Emerald 500
  error: '#EF4444', // Red 500
  bg: '#F8FAFC'
};

export const LEVELS = [
  { id: 'Basic', label: 'Básico', color: 'bg-green-100 text-green-700', icon: <Star size={16} /> },
  { id: 'Intermediate', label: 'Intermediário', color: 'bg-blue-100 text-blue-700', icon: <Zap size={16} /> },
  { id: 'Advanced', label: 'Avançado', color: 'bg-purple-100 text-purple-700', icon: <Trophy size={16} /> }
];

export const LANGUAGES = [
  { id: 'Portuguese', label: 'Português', flag: '🇧🇷' },
  { id: 'Spanish', label: 'Espanhol', flag: '🇪🇸' },
  { id: 'French', label: 'Francês', flag: '🇫🇷' }
];

export const ICONS = {
  Home: <Home size={24} />,
  Practice: <BookOpen size={24} />,
  Ranking: <Trophy size={24} />,
  History: <List size={24} />,
  Profile: <User size={24} />,
  Stats: <BarChart3 size={24} />,
  Next: <ChevronRight size={20} />,
  Success: <CheckCircle2 size={24} />,
  Warning: <AlertCircle size={24} />
};
