import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

// Create axios instance with interceptors
export const authApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Response interceptor to handle 401 errors
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl: string | undefined = error.config?.url;
    const isAuthEndpoint =
      requestUrl?.startsWith('/api/auth/login') ||
      requestUrl?.startsWith('/api/auth/register') ||
      requestUrl?.startsWith('/api/auth/google') ||
      requestUrl?.startsWith('/api/auth/logout');

    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export interface User {
  id: string;
  email: string;
  userName: string;
}

export interface AuthResponse {
  message: string;
  user?: User;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const authService = {
  register: async (userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await authApi.post('/api/auth/register', {
      userName: userData.username,
      email: userData.email,
      password: userData.password,
    });
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
  },

  googleAuth: async (credential: string): Promise<AuthResponse> => {
    const response = await authApi.post('/api/auth/google', { credential });
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await authApi.post('/api/auth/login', credentials);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await authApi.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('user');
  },
};
