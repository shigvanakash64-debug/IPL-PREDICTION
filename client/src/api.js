import axios from 'axios';

const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const baseURL = `${apiHost.replace(/\/$/, '')}/api`;
const USER_ID_KEY = 'binary-prediction-user-id';
const AUTH_STORAGE_KEY = 'prediction-auth';

const getUserIdentifier = () => {
  let storedId = localStorage.getItem(USER_ID_KEY);
  if (!storedId) {
    storedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`;
    localStorage.setItem(USER_ID_KEY, storedId);
  }
  return storedId;
};

const getAuthToken = () => {
  const authString = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!authString) return null;

  try {
    const auth = JSON.parse(authString);
    return auth.token;
  } catch {
    return null;
  }
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

  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export { AUTH_STORAGE_KEY };
export default api;
