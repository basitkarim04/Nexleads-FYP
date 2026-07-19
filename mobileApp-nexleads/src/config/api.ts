import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { tokenStorage } from '../utils/token';
import { router } from 'expo-router';

export const BASE_URL = "https://backend-nexleads-production.up.railway.app/api";
// export const BASE_URL = "http://192.168.100.20:5000/api";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await tokenStorage.clearAll();
      router.replace('/auth/login');
    }
    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
