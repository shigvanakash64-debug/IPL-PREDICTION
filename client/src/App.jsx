import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api, { AUTH_STORAGE_KEY } from './api';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminPanel from './pages/AdminPanel';

const loadAuth = () => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

const saveAuth = (authData) => {
  if (authData) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

function App() {
  const [auth, setAuth] = useState(loadAuth());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    saveAuth(auth);
  }, [auth]);

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', credentials);
      setAuth(response.data);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (payload) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', payload);
      setAuth(response.data);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuth(null);
  };

  const authUser = auth?.user || null;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Routes>
            <Route
              path="/login"
              element={authUser ? <Navigate to={authUser.role === 'admin' ? '/admin' : '/dashboard'} /> : <LoginPage onLogin={handleLogin} loading={loading} />}
            />
            <Route
              path="/register"
              element={authUser ? <Navigate to={authUser.role === 'admin' ? '/admin' : '/dashboard'} /> : <RegisterPage onRegister={handleRegister} loading={loading} />}
            />
            <Route
              path="/dashboard"
              element={authUser ? (authUser.role === 'admin' ? <Navigate to="/admin" /> : <UserDashboard authUser={authUser} onLogout={handleLogout} api={api} />) : <Navigate to="/login" />}
            />
            <Route
              path="/admin"
              element={authUser ? (authUser.role === 'admin' ? <AdminPanel authUser={authUser} onLogout={handleLogout} api={api} /> : <Navigate to="/dashboard" />) : <Navigate to="/login" />}
            />
            <Route
              path="/"
              element={authUser ? <Navigate to={authUser.role === 'admin' ? '/admin' : '/dashboard'} /> : <Navigate to="/login" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
