// src/services/authService.ts
import api from './api';

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: number; 
  dateOfBirth : Date;
  country:string;
  expertise: string;
  portfolioUrl?: string;
  cvLink: string;
}export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: number; 
  dateOfBirth : Date;
  country:string;
  expertise: string;
  portfolioUrl?: string;
  cvLink: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
    register: async (data: RegisterData) => {
    const payload = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: data.role,
      dateOfBirth: data.dateOfBirth,
      country: data.country,

      ...(data.expertise && { expertise: data.expertise }),
      ...(data.portfolioUrl && { portfolioUrl: data.portfolioUrl }),
      ...(data.cvLink && { cvLink: data.cvLink }),
    };

    const response = await api.post('/auth/register', payload);
    return response.data;
    }
    ,

  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  googleAuth: async () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${api.defaults.baseURL}/auth/google`;
  },
};