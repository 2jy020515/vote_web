import axios from 'axios';

const API = axios.create({
  baseURL: '/',
  withCredentials: true,
});
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    const userHash = localStorage.getItem('userHash');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (userHash) {
      config.headers['X-User-Hash'] = userHash;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
