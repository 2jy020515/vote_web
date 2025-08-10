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

    // 리프레시 토큰으로 재발급 시도 조건 (status === 'REFRESH_TOKEN' 일 때)
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
        // 리프레시 토큰 만료된 상태: 로그아웃 처리 후 로그인 페이지 이동
        logoutAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    // 401 Unauthorized 응답 (예: 액세스토큰 만료 및 재발급 실패 등)
    if (error.response && error.response.status === 401) {
      logoutAndRedirect();
    }

    return Promise.reject(error);
  }
);

function logoutAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userHash');
  if (!window._redirectingToLogin) {
    window._redirectingToLogin = true;
    window.location.href = '/login';
  }
}

export default API;