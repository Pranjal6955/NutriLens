import { http, extractErrorMessage } from '../lib/http';

export interface AuthUser {
  id: string;
  email: string;
  userName: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
}

export const register = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await http.post('/auth/register', {
      userName: payload.name,
      email: payload.email,
      password: payload.password,
    });
    return response.data as { message: string };
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const login = async (payload: { email: string; password: string }) => {
  try {
    const response = await http.post('/auth/login', payload);
    return response.data as AuthResponse;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const logout = async () => {
  try {
    await http.post('/auth/logout');
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const fetchCurrentUser = async () => {
  try {
    const response = await http.get('/auth/dashboard');
    return response.data.user as AuthUser;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
