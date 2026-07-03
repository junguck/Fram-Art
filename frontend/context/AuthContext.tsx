import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';

export interface AuthUser {
  _id: string;
  nom_utilisateur: string;
  email: string;
  role: 'utilisateur' | 'artiste' | 'administrateur';
  url_avatar?: string | null;
  bio?: string;
  est_actif: boolean;
  est_banni: boolean;
  cree_le: string;
  abonnements_ids?: string[];
  abonnes_ids?: string[];
  compteurs?: {
    abonnements: number;
    abonnes: number;
    oeuvres: number;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nom_utilisateur: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<AuthUser>) => void;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await api.getMe();
          if (response.data) {
            setUser(response.data);
          }
        } catch (error) {
          console.error('Erreur lors du chargement de l\'utilisateur:', error);
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        if (response.data) {
          setUser(response.data);
        }
      }
    } catch (error) {
      console.error('Erreur login:', error);
      throw error;
    }
  };

  const register = async (nom_utilisateur: string, email: string, password: string) => {
    try {
      const response = await api.register(nom_utilisateur, email, password);
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        if (response.data) {
          setUser(response.data);
        }
      }
    } catch (error) {
      console.error('Erreur register:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Erreur logout:', error);
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.getMe();
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Erreur refresh user:', error);
    }
  };

  const updateUser = (data: Partial<AuthUser>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
