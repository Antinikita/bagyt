import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axios-client';

const AuthContext = createContext({
  user: null,
  roles: [],
  permissions: [],
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  updateProfile: async () => {},
  changePassword: async () => {},
  can: () => false,
  hasRole: () => false,
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((data) => {
    setUser(data.user ?? null);
    setRoles(Array.isArray(data.roles) ? data.roles : []);
    setPermissions(Array.isArray(data.permissions) ? data.permissions : []);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setRoles([]);
    setPermissions([]);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await axiosClient.get('/user');
    applySession(data);
    return data;
  }, [applySession]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    refreshUser()
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, [refreshUser, clearSession]);

  const login = async (email, password) => {
    const { data } = await axiosClient.post('/login', { email, password });
    localStorage.setItem('token', data.token);
    applySession(data);
  };

  const register = async (name, email, sex, age, password, password_confirmation) => {
    const { data } = await axiosClient.post('/register', {
      name, email, sex, age, password, password_confirmation,
    });
    localStorage.setItem('token', data.token);
    applySession(data);
  };

  const logout = async () => {
    try {
      await axiosClient.post('/logout');
    } catch (e) {
      // silent — we always clear local state regardless
    } finally {
      clearSession();
    }
  };

  const updateProfile = useCallback(async (patch) => {
    const { data } = await axiosClient.patch('/user', patch);
    applySession(data);
    return data;
  }, [applySession]);

  const changePassword = useCallback(async ({ current_password, password, password_confirmation }) => {
    const { data } = await axiosClient.put('/user/password', {
      current_password,
      password,
      password_confirmation,
    });
    return data;
  }, []);

  const can = useCallback((perm) => permissions.includes(perm), [permissions]);
  const hasRole = useCallback((role) => roles.includes(role), [roles]);

  return (
    <AuthContext.Provider
      value={{ user, roles, permissions, login, register, logout, refreshUser, updateProfile, changePassword, can, hasRole, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
