import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor to attach the token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// NEW: Interceptor to handle token expiration/unauthorized errors
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    // Check if the error is 401 (Unauthorized) or 403 (Forbidden)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Token expired or invalid. Redirecting to login...");
      
      // 1. Clear all session data
      localStorage.clear();
      
      // 2. Force a full page reload to the root (Login)
      window.location.href = "/"; 
    }
    return Promise.reject(error);
  }
);

export default api;