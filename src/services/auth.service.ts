import api from '@/lib/axios';
import { LoginSchema } from '@/lib/schemas/auth';

const AUTH_ENDPOINT = '/auth';

interface LoginResponse {
  success: true;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      role: string;
      fullName: string;
    };
  };
}

// Helper to handle local storage effects
const saveSession = (token: string, user: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

const clearSession = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

export const login = async (credentials: LoginSchema) => {
  const { data } = await api.post<LoginResponse>(`${AUTH_ENDPOINT}/login`, credentials);
  if (data.success) {
    saveSession(data.data.token, data.data.user);
  }
  return data.data;
};

export const logout = () => {
  clearSession();
};
