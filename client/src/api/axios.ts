import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 180000),
  withCredentials: true,
});

export default api;
