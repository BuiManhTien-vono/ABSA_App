import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getMe();
          setUser(currentUser);
        } catch {
          authService.logout();
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser({ email: data.email, fullName: data.fullName, role: data.role });
    return data;
  };

  const register = async (email, password, fullName) => {
    const data = await authService.register(email, password, fullName);
    setUser({ email: data.email, fullName: data.fullName, role: data.role });
    return data;
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
