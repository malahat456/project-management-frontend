import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api", // backend URL
  withCredentials: false,
});

// Attach token automatically to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // Change header according to your backend
    config.headers["Authorization"] = `Bearer ${token}`; // or "x-auth-token"
  }
  return config;
});

// Optional: auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/"; // redirect to login
    }
    return Promise.reject(error);
  }
);
