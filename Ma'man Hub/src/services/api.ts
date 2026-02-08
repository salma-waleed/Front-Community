import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7220/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add token to every request
api.interceptors.request.use((config) => {
  if (import.meta.env.DEV) {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
    });
  }
  
  // Get token from localStorage
  const token = localStorage.getItem('access_token');
  
  if (token) {
    // Add Authorization header
    config.headers.Authorization = `Bearer ${token}`;
    if (import.meta.env.DEV) {
      console.log('Token added to request:', token.substring(0, 20) + '...');
    }
  } else {
    if (import.meta.env.DEV) {
      console.log('No token found in localStorage');
    }
  }
  
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Response interceptor - Handle responses and errors
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('API Response:', response.data);
    }
    return response;
  },
  async (error) => {
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
      });
    }

    const originalRequest = error.config;
    
    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          console.error('No refresh token available');
          throw new Error('No refresh token');
        }
        
        console.log('Attempting token refresh...');
        // Backend expects PascalCase
        const { data } = await axios.post(`${API_BASE_URL}/Auth/refresh-token`, {
          refreshToken: refreshToken,
        });
        
        // Save new access token (backend returns PascalCase)
        localStorage.setItem('access_token', data.accessToken);
        
        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        
        console.log('Token refreshed successfully, retrying request...');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;