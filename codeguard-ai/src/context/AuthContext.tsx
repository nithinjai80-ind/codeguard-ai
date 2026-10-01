import React, { createContext, useContext, useState, useEffect } from 'react';
import { RoxApiService, User } from '../api/apiService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  register: (name: string, email: string, password: string, role?: string, department?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cg_user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.role === 'TUTOR') parsed.role = 'TEACHER';
      return parsed;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('cg_token');
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem('cg_token');
      if (savedToken) {
        try {
          const currentUser = await RoxApiService.getCurrentUser();
          if (currentUser) {
            if ((currentUser.role as any) === 'TUTOR') currentUser.role = 'TEACHER';
            setUser(currentUser);
            localStorage.setItem('cg_user', JSON.stringify(currentUser));
          } else {
            // Invalid session
            localStorage.removeItem('cg_token');
            localStorage.removeItem('cg_user');
            setUser(null);
            setToken(null);
          }
        } catch {
          // If offline / backend unreachable, keep saved user or clear if expired
        }
      }
      setIsLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = true): Promise<User> => {
    const res = await RoxApiService.login(email, password);
    const loggedUser = res.user;
    if ((loggedUser.role as any) === 'TUTOR') loggedUser.role = 'TEACHER';

    setToken(res.token);
    setUser(loggedUser);
    if (rememberMe) {
      localStorage.setItem('cg_token', res.token);
      localStorage.setItem('cg_user', JSON.stringify(loggedUser));
    } else {
      sessionStorage.setItem('cg_token', res.token);
      sessionStorage.setItem('cg_user', JSON.stringify(loggedUser));
    }
    return loggedUser;
  };

  const register = async (name: string, email: string, password: string, role: string = 'STUDENT', department: string = 'Computer Science and Engineering') => {
    const res = await RoxApiService.register({ name, email, password, role, department });
    const regUser = res.user;
    if ((regUser.role as any) === 'TUTOR') regUser.role = 'TEACHER';

    setToken(res.token);
    setUser(regUser);
    localStorage.setItem('cg_token', res.token);
    localStorage.setItem('cg_user', JSON.stringify(regUser));
  };

  const logout = () => {
    RoxApiService.logout().catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem('cg_token');
    localStorage.removeItem('cg_user');
    sessionStorage.removeItem('cg_token');
    sessionStorage.removeItem('cg_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
