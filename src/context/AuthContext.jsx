import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axios-client";
import { sanctumRequest } from "../config/sanctumRequest";
import { getCsrfToken } from "../config/csrf";

const AuthContext = createContext({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Проверка авторизации
  useEffect(() => {
    axiosClient.get('/user')
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
  try {
    // Make sure the CSRF cookie and token are fresh by calling this first:
    

    // Now attempt login with email/password, passing the CSRF token in header (sanctumRequest does that)
    const response = await sanctumRequest('post', '/login', {
      email,
      password,
    });

    // After login success, fetch authenticated user info
    const userResponse = await sanctumRequest('get', '/user');

    // // Handle setting user in your app state/context
    // const user = userResponse.data;
    // // e.g. setUser(user);
    
    const { data } = await axiosClient.get('/user');     
    
    setUser(data);

  } catch (error) {
    console.error('Login attempt failed:', error);
    throw error;
  }
}

  const register = async (name, email, password,password_confirmation) => {
  try {
  

    // Register new user
    const response = await sanctumRequest('post', '/register', {
      name,      // ✅ Add name field
      email,
      password,
      password_confirmation
    });

    console.log('✅ Registration successful:', response.data);

    // Auto-login after registration (optional but smooth UX)
    const userResponse = await sanctumRequest('get', '/user');
    const user = userResponse.data;
    
    console.log('✅ Auto-logged in user:', user);
    return user;  // Return user for context

  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
    throw error;
  }
};


  const logout = async () => {
  try {
    // Get fresh CSRF token (same pattern)
    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
      console.warn('No CSRF token, but continuing logout');
    }

    // Call logout endpoint
    const response = await sanctumRequest('post', '/logout');
    
    console.log('✅ Logout successful:', response.data);

    // Clear local state
    setUser(null);
    
    // Navigate to login
    navigate('/login', { replace: true });
    
    return true;

  } catch (error) {
    console.error('❌ Logout failed:', error.response?.data || error.message);
    
    // Force clear state even if API fails
    setUser(null);
    navigate('/login', { replace: true });
    
    return false;
  }
};


  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);