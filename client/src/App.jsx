import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import api, { AUTH_STORAGE_KEY } from './api';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminPanel from './pages/AdminPanel';
import AdminPayments from './pages/AdminPayments';
import BetPage from './pages/BetPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';

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
  const [menuOpen, setMenuOpen] = useState(false);

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
      <div className="relative min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="absolute right-4 top-4 z-20 text-right">
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-white"
          >
            Menu
          </button>
          {menuOpen && (
            <div className="mt-3 w-44 rounded-3xl border border-slate-700 bg-slate-900 p-3 shadow-glow text-left">
              {auth?.user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full rounded-2xl bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-2xl bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="mt-2 block rounded-2xl bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

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
              path="/admin/payments"
              element={authUser ? (authUser.role === 'admin' ? <AdminPayments authUser={authUser} onLogout={handleLogout} api={api} /> : <Navigate to="/dashboard" />) : <Navigate to="/login" />}
            />
            <Route
              path="/bet"
              element={authUser ? <BetPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/payment"
              element={authUser ? <PaymentPage authUser={authUser} /> : <Navigate to="/login" />}
            />
            <Route
              path="/confirmation"
              element={authUser ? <ConfirmationPage /> : <Navigate to="/login" />}
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
