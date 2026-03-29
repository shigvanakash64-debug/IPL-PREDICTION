import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const USER_ID_KEY = 'binary-prediction-user-id';

const getUserIdentifier = () => {
  let storedId = localStorage.getItem(USER_ID_KEY);
  if (!storedId) {
    storedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`;
    localStorage.setItem(USER_ID_KEY, storedId);
  }
  return storedId;
};

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const identifier = getUserIdentifier();
  config.headers = config.headers || {};
  config.headers['x-user-identifier'] = identifier;
  return config;
});

export default api;
