// src/api.ts
import axios from "axios";

// పాత Localhost తీసేసి, కొత్త Render లింక్ పెట్టండి:
const api = axios.create({
  baseURL: "https://edu2jobs-backend.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;