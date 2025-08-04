import axios from 'axios';

const API = axios.create({
  baseURL: '/',
  withCredentials: true,
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  const userHash = localStorage.getItem('userHash');

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  if (userHash) {
    config.headers['X-User-Hash'] = userHash;
  }

  return config;
});

API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.data?.status === 'REFRESH_TOKEN' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.get(`/api/v1/auth/refresh-token`, {
          withCredentials: true,
        });

        if (res.status === 200) {
          const newAccessToken = res.headers['authorization'];
          if (newAccessToken && newAccessToken.startsWith('Bearer ')) {
            const tokenOnly = newAccessToken.substring(7);
            localStorage.setItem('accessToken', tokenOnly);
            originalRequest.headers['Authorization'] = `Bearer ${tokenOnly}`;
            return API(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userHash');
        if (!window._redirectingToLogin) {
          window._redirectingToLogin = true;
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userHash');
      if (!window._redirectingToLogin) {
        window._redirectingToLogin = true;
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default API;