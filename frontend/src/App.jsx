import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import EventTypesPage from './pages/EventTypesPage';
import AvailabilityPage from './pages/AvailabilityPage';
import BookingPage from './pages/BookingPage';
import MeetingsPage from './pages/MeetingsPage';
import PublicProfilePage from './pages/PublicProfilePage';
import ConfirmationPage from './pages/ConfirmationPage';
import './App.css';

const THEME_STORAGE_KEY = 'slotify-theme';
const AUTH_STORAGE_KEY = 'slotify-auth';

function AppRoutes({ theme, onToggleTheme, isAuthenticated, onAuthenticated, onLogout, authUser }) {
  const location = useLocation();
  const isPublicRoute = location.pathname.startsWith('/book/') || location.pathname.startsWith('/u/') || location.pathname.startsWith('/confirmation/');
  const ThemeIcon = theme === 'dark' ? Sun : Moon;
  const themeLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <>
      {isPublicRoute && (
        <button
          onClick={onToggleTheme}
          aria-label={themeLabel}
          title={themeLabel}
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 100,
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--header-glass-bg)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-sm)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <ThemeIcon size={18} />
        </button>
      )}

      <Routes>
        <Route path="/login" element={<LoginPage isAuthenticated={isAuthenticated} onAuthenticated={onAuthenticated} />} />
        <Route path="/book/:slug" element={<BookingPage />} />
        <Route path="/u/:username" element={<PublicProfilePage />} />
        <Route path="/confirmation/:bookingId" element={<ConfirmationPage />} />
        
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Layout theme={theme} onToggleTheme={onToggleTheme} onLogout={onLogout} authUser={authUser} />
              : <Navigate to="/login" replace />
          }
        >
          <Route index element={<HomePage />} />
          <Route path="event-types" element={<EventTypesPage />} />
          <Route path="availability" element={<AvailabilityPage />} />
          <Route path="meetings" element={<MeetingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>
    </>
  );
}

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [authState, setAuthState] = useState(() => {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (authState) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [authState]);

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  }

  function handleAuthenticated(payload) {
    setAuthState({ token: payload.token, user: payload.user });
  }

  function handleLogout() {
    setAuthState(null);
  }

  return (
    <Router>
      <AppRoutes
        theme={theme}
        onToggleTheme={toggleTheme}
        isAuthenticated={Boolean(authState?.token)}
        onAuthenticated={handleAuthenticated}
        onLogout={handleLogout}
        authUser={authState?.user || null}
      />
    </Router>
  );
}

export default App;
