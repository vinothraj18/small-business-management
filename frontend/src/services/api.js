
import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`
});

API.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('userInfo');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
