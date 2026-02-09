import { supabase } from './supabaseClient';
import { AuthSession, AuthUser } from '../types';

export const supabaseAuthService = {
  // Login com email e senha
  async signIn(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.user || !data.session) throw new Error('Login failed');

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || data.user.email!.split('@')[0],
      },
      token: data.session.access_token,
    };
  },

  // Cadastro com email e senha
  async signUp(email: string, password: string, name: string): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      console.error('Signup error:', error);
      throw new Error(error.message);
    }
    
    if (!data.user) {
      throw new Error('Signup failed: No user returned');
    }

    // Se não houver sessão, pode ser porque o email precisa ser confirmado
    if (!data.session) {
      throw new Error('Por favor, confirme seu email antes de fazer login');
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: name,
      },
      token: data.session.access_token,
    };
  },

  // Login com Google
  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) throw new Error(error.message);
  },

  // Login com GitHub
  async signInWithGithub(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) throw new Error(error.message);
  },

  // Recuperar senha
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`,
    });

    if (error) throw new Error(error.message);
  },

  // Logout
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  // Obter sessão atual
  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) return null;

    return {
      user: {
        id: data.session.user.id,
        email: data.session.user.email!,
        name: data.session.user.user_metadata?.name || data.session.user.email!.split('@')[0],
      },
      token: data.session.access_token,
    };
  },

  // Listener para mudanças de autenticação
  onAuthStateChange(callback: (session: AuthSession | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        callback({
          user: {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
          },
          token: session.access_token,
        });
      } else {
        callback(null);
      }
    });
  },
};
