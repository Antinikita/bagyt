import { createContext, useContext, useState, useEffect } from 'react';
import { sanctumRequest } from '../config/sanctumRequest';
import { registerAuthErrorHandler } from '../api/axios-client';

const AuthContext = createContext({
  user: null,
  login: async (_email, _password) => {},
  register: async (_name, _email, _sex, _age, _password, _passwordConfirmation) => {},
  logout: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registerAuthErrorHandler(() => setUser(null));
    sanctumRequest('get', '/user')
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await sanctumRequest('post', '/login', { email, password });
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, sex, age, password, password_confirmation) => {
    const { data } = await sanctumRequest('post', '/register', {
      name,
      email,
      sex,
      age,
      password,
      password_confirmation,
    });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await sanctumRequest('post', '/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
