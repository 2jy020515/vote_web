import axios from "axios";

const API = axios.create({
  baseURL: "/",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const userHash = localStorage.getItem("userHash");

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  if (userHash) {
    config.headers["X-User-Hash"] = userHash;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalUrl = error.config?.url;

    if (originalUrl && originalUrl.includes("/api/v1/user/login")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 403 || error.response?.status === 401) {
      alert("⏰ 세션이 만료되었습니다. 다시 로그인 해주세요.");
      localStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;
