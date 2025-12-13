// Standalone AuthContext stub
// Authentication is disabled in standalone mode
import React, { createContext, useContext, ReactNode } from 'react';

interface User {
  id?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  currentUser: User | null; // Alias for compatibility
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const contextValue: AuthContextType = {
    user: null,
    currentUser: null, // Alias for compatibility
    loading: false,
    signIn: async () => {
      console.warn('[Standalone Mode] Authentication is disabled');
    },
    signOut: async () => {
      console.warn('[Standalone Mode] Authentication is disabled');
    },
    signUp: async () => {
      console.warn('[Standalone Mode] Authentication is disabled');
    },
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    // Return default values if used outside provider
    return {
      user: null,
      currentUser: null, // Alias for compatibility
      loading: false,
      signIn: async () => {},
      signOut: async () => {},
      signUp: async () => {},
    };
  }
  return context;
}
