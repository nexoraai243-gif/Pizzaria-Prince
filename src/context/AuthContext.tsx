import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';

interface AuthContextType {
  adminUser: AdminUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'pizzaria_prince_admin_jwt';
const USER_KEY = 'pizzaria_prince_admin_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verify stored session on boot
  useEffect(() => {
    const verifyStoredAuth = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        setAdminUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/me', {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.admin) {
            setAdminUser(data.admin);
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session verification error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifyStoredAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setToken(data.token);
        setAdminUser(data.admin);
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.admin));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Credenciais inválidas.' };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Erro de ligação com o servidor.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
      }
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setAdminUser(null);
      setToken(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        token,
        login,
        logout,
        isLoading,
        isAuthenticated: !!adminUser && !!token,
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
