import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (email, password) => 
    api.post('/auth/signup', { email, password }),
  
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  logout: () => 
    api.post('/auth/logout'),
};

export const pdfAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  list: () => 
    api.get('/pdf/list'),

  query: (fileId, query) => {
    const formData = new FormData();
    formData.append('file_id', fileId);
    formData.append('query', query);
    return api.post('/pdf/query', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getHistory: (fileId) => 
    api.get(`/pdf/history/${fileId}`),

  delete: (fileId) => 
    api.delete(`/pdf/${fileId}`),

  newConversation: (fileId) => 
    api.post(`/pdf/new-conversation/${fileId}`),
};

export const userAPI = {
  getMe: () => 
    api.get('/user/me'),
};

export default api;