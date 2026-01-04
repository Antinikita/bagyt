import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axios-client";
import axios from "axios"; // Нужен чистый axios для CSRF

const StateContext = createContext({
  user: null,
  setUser: () => {},
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  loadingUser: true,
});

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const login = async ({ email, password }) => {
    // 1. Берем CSRF-куку. Используем сырой axios с withCredentials, чтобы не мешал baseURL
    await axios.get("http://localhost:8000/sanctum/csrf-cookie", { withCredentials: true });
    
    // 2. Логинимся. Запрос пойдет на http://localhost:8000/api/login
    await axiosClient.post("/login", { email, password });
    
    // 3. Получаем юзера. Запрос на http://localhost:8000/api/user
    const { data } = await axiosClient.get("/user");
    setUser(data);
  };

  const register = async ({ name, email, password, password_confirmation }) => {
    await axios.get("http://localhost:8000/sanctum/csrf-cookie", { withCredentials: true });
    await axiosClient.post("/register", { name, email, password, password_confirmation });
    const { data } = await axiosClient.get("/user");
    setUser(data);
  };

  const logout = async () => {
    await axiosClient.post("/logout");
    setUser(null);
  };

  // Проверка сессии при загрузке страницы
  useEffect(() => {
    axiosClient.get('/user')
      .then(({ data }) => {
        setUser(data);
      })
      .catch(() => {
        // Если 401 - значит не залогинен, просто ставим null
        setUser(null);
      })
      .finally(() => {
        setLoadingUser(false);
      });
  }, []);

  return (
    <StateContext.Provider value={{ user, setUser, login, register, logout, loadingUser }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);