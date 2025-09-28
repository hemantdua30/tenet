'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, signIn as authSignIn } from '../lib/auth';

// Auth context interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  error: string | null;
  userRole: string | null;
}

// Auth provider props interface
interface AuthProviderProps {
  children: ReactNode;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check for user in local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedUserRole = localStorage.getItem('userRole');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
    
    if (storedUserRole) {
      setUserRole(storedUserRole);
    }
  }, []);

  // Sign in function
  const signIn = async (username: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const authenticatedUser = await authSignIn(username, password);
      localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      
      // Set userRole from the authenticated user
      if (authenticatedUser.userRole) {
        setUserRole(authenticatedUser.userRole);
      }
      
      return authenticatedUser;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, error, userRole }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 