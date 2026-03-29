import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Layout from './components/Layout/Layout';
import EventTypesPage from './pages/EventTypesPage';
import AvailabilityPage from './pages/AvailabilityPage';
import BookingPage from './pages/BookingPage';
import MeetingsPage from './pages/MeetingsPage';
import PublicProfilePage from './pages/PublicProfilePage';
import './App.css';

const THEME_STORAGE_KEY = 'slotify-theme';

function AppRoutes({ theme, onToggleTheme }) {
  const location = useLocation();
  const isPublicRoute = location.pathname.startsWith('/book/') || location.pathname.startsWith('/u/');
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
        <Route path="/book/:slug" element={<BookingPage />} />
        <Route path="/u/:username" element={<PublicProfilePage />} />
        
        <Route path="/" element={<Layout theme={theme} onToggleTheme={onToggleTheme} />}>
          <Route index element={<Navigate to="/event-types" replace />} />
          <Route path="event-types" element={<EventTypesPage />} />
          <Route path="availability" element={<AvailabilityPage />} />
          <Route path="meetings" element={<MeetingsPage />} />
        </Route>
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  }

  return (
    <Router>
      <AppRoutes theme={theme} onToggleTheme={toggleTheme} />
    </Router>
  );
}

export default App;
