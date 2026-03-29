import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Calendar, Clock, Globe, Link as LinkIcon, Moon, PanelLeftClose, PanelLeftOpen, Sun } from 'lucide-react';
import useMediaQuery from '../../hooks/useMediaQuery';

const primarySteps = [
  { name: 'Event Types', path: '/event-types', icon: LinkIcon, step: 1, helper: 'Create your first event type' },
  { name: 'Availability', path: '/availability', icon: Clock, step: 2, helper: 'Set your working hours' },
  { name: 'Booking Page', href: '/u/rajendradhaka', icon: Globe, step: 3, helper: 'Preview and share publicly' },
];

const secondaryNavItems = [
  { name: 'Meetings', path: '/meetings', icon: Calendar },
];

const pageMeta = {
  '/event-types': {
    eyebrow: 'Scheduling',
    title: 'Event types',
    description: 'Build a small set of booking options that feel clear, useful, and worth sharing.',
  },
  '/meetings': {
    eyebrow: 'Meetings',
    title: 'What is booked',
    description: 'A running record of upcoming calls, cancellations, and everything already behind you.',
  },
  '/availability': {
    eyebrow: 'Availability',
    title: 'Bookable hours',
    description: 'Control the hours your public links are allowed to use, without turning the page into a settings maze.',
  },
};

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'slotify-sidebar-collapsed';

function getCurrentPage(pathname) {
  return pageMeta[pathname] || pageMeta['/event-types'];
}

function getActiveStep(pathname) {
  if (pathname.startsWith('/availability')) {
    return 2;
  }
  if (pathname.startsWith('/u/')) {
    return 3;
  }
  return 1;
}

function BrandLockup({ collapsed = false }) {
  return (
    <Link
      to="/event-types"
      style={{ display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '0.95rem', justifyContent: collapsed ? 'center' : 'flex-start' }}
      title="Go to Event Types"
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
          color: '#fff',
          fontFamily: 'Syne, DM Sans, sans-serif',
          fontWeight: 800,
          fontSize: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        S
      </div>
      {!collapsed && (
        <div>
          <div style={{ fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.12rem', fontWeight: 700, letterSpacing: '-0.04em' }}>
            Slotify
          </div>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.58)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Calendar system
          </div>
        </div>
      )}
    </Link>
  );
}

export default function Layout({ theme = 'light', onToggleTheme }) {
  const location = useLocation();
  const isCompact = useMediaQuery('(max-width: 960px)');
  const isMediumDesktop = useMediaQuery('(max-width: 1240px)');
  const currentMeta = getCurrentPage(location.pathname);
  const activeStep = getActiveStep(location.pathname);
  const completedStepCount = Math.max(activeStep - 1, 0);
  const publicPagePath = '/u/rajendradhaka';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const ThemeIcon = theme === 'dark' ? Sun : Moon;
  const nextThemeLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  const sidebarExpandedWidth = isMediumDesktop ? 248 : 288;
  const sidebarCollapsedWidth = 96;
  const sidebarWidth = isSidebarCollapsed ? sidebarCollapsedWidth : sidebarExpandedWidth;
  const SidebarToggleIcon = isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose;
  const sidebarToggleLabel = isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar';

  if (isCompact) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            padding: '1rem 1rem 0',
            background: 'var(--header-glass-bg)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div
            className="card"
            style={{
              padding: '0.95rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.9rem',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {currentMeta.eyebrow}
              </div>
              <div style={{ marginTop: '0.15rem', fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.08rem', fontWeight: 700, letterSpacing: '-0.04em' }}>
                {currentMeta.title}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <button
                className="btn btn-outline"
                onClick={onToggleTheme}
                style={{ minHeight: '40px', width: '40px', padding: 0 }}
                aria-label={nextThemeLabel}
                title={nextThemeLabel}
              >
                <ThemeIcon size={16} />
              </button>
              <a
                href={publicPagePath}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ minHeight: '40px', width: '40px', padding: 0 }}
                aria-label="Open public booking page"
              >
                <Globe size={16} />
              </a>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                R
              </div>
            </div>
          </div>
        </header>

        <main style={{ padding: '0 1rem calc(6rem + env(safe-area-inset-bottom))' }}>
          <Outlet />
        </main>

        <nav
          style={{
            position: 'fixed',
            insetInline: 0,
            bottom: 0,
            zIndex: 50,
            display: 'grid',
            gridTemplateColumns: `repeat(${primarySteps.length}, minmax(0, 1fr))`,
            gap: '0.45rem',
            padding: '0.75rem 1rem calc(0.85rem + env(safe-area-inset-bottom))',
            background: 'var(--mobile-nav-bg)',
            backdropFilter: 'blur(18px)',
            borderTop: '1px solid var(--border)',
          }}
        >
          {primarySteps.map((item) => {
            const isExternal = Boolean(item.href);
            const isActive = item.path ? location.pathname.startsWith(item.path) : false;
            const commonStyle = {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.32rem',
              padding: '0.7rem 0.4rem',
              borderRadius: '14px',
              border: `1px solid ${isActive ? 'var(--border-strong)' : 'transparent'}`,
              background: isActive ? 'rgba(255, 253, 247, 0.82)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.72rem',
              fontWeight: 700,
            };

            if (isExternal) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={commonStyle}
                >
                  <item.icon size={17} />
                  <span>{item.name}</span>
                </a>
              );
            }

            return (
              <Link key={item.path} to={item.path} style={commonStyle}>
                <item.icon size={17} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: `${sidebarWidth}px`,
          position: 'fixed',
          inset: 0,
          padding: isSidebarCollapsed ? '1.2rem 0.7rem' : '1.5rem',
          background: 'linear-gradient(180deg, #181a20 0%, #12141a 100%)',
          color: '#f7f1e7',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.35rem',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 30,
          transition: 'width 0.22s ease, padding 0.22s ease',
          overflow: 'hidden',
        }}
      >
        <button
          className="sidebar-edge-toggle"
          onClick={() => setIsSidebarCollapsed((value) => !value)}
          style={{ top: isSidebarCollapsed ? '1rem' : '3.9rem' }}
          aria-label={sidebarToggleLabel}
          title={sidebarToggleLabel}
        >
          <SidebarToggleIcon size={16} />
        </button>

        <BrandLockup collapsed={isSidebarCollapsed} />

        {!isSidebarCollapsed ? (
          <div
            style={{
              padding: '1.1rem',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.04)',
            }}
          >
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.52)' }}>
              Setup progress
            </div>
            <div style={{ marginTop: '0.7rem', fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.04em' }}>
              {completedStepCount}/3 completed
            </div>
            <p style={{ marginTop: '0.55rem', color: 'rgba(255, 255, 255, 0.66)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Finish Event Types, Availability, then preview your Booking Page before sharing it.
            </p>
            <a
              href={publicPagePath}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-light"
              style={{ width: '100%', marginTop: '1rem', justifyContent: 'space-between' }}
            >
              Preview booking page
              <Globe size={16} />
            </a>
          </div>
        ) : (
          <a
            href={publicPagePath}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-light"
            aria-label="Open public booking page"
            title="Open public page"
            style={{ width: '100%', minHeight: '42px', padding: 0 }}
          >
            <Globe size={16} />
          </a>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {primarySteps.map((item) => {
            const isExternal = Boolean(item.href);
            const isActive = item.path ? location.pathname.startsWith(item.path) : false;
            const isCompleted = completedStepCount >= item.step;
            const navItemStyle = {
              display: 'grid',
              gridTemplateColumns: isSidebarCollapsed ? '1fr' : '32px minmax(0, 1fr) 18px',
              alignItems: 'center',
              gap: '0.75rem',
              padding: isSidebarCollapsed ? '0.78rem 0.55rem' : '0.85rem 0.95rem',
              borderRadius: '16px',
              border: `1px solid ${isActive ? 'rgba(255, 255, 255, 0.22)' : 'transparent'}`,
              background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.76)',
              justifyItems: isSidebarCollapsed ? 'center' : 'stretch',
            };

            const content = isSidebarCollapsed ? (
              <item.icon size={18} />
            ) : (
              <>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  0{item.step}
                </span>
                <span style={{ display: 'grid', gap: '0.2rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontWeight: 700 }}>
                    <item.icon size={17} />
                    {item.name}
                  </span>
                  <span style={{ fontSize: '0.73rem', color: 'rgba(255, 255, 255, 0.56)' }}>{item.helper}</span>
                </span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isCompleted ? 'var(--success)' : 'rgba(255, 255, 255, 0.2)' }} />
              </>
            );

            if (isExternal) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.name}
                  style={navItemStyle}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link key={item.path} to={item.path} title={item.name} style={navItemStyle}>
                {content}
              </Link>
            );
          })}
        </nav>

        {!isSidebarCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.52)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Secondary
            </div>
            {secondaryNavItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '14px',
                    color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                    background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  }}
                >
                  <item.icon size={16} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}

        <div
          style={{
            marginTop: 'auto',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              R
            </div>
            {!isSidebarCollapsed && (
              <div>
                <div style={{ fontWeight: 700 }}>Rajendra Dhaka</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.56)', fontSize: '0.84rem' }}>Workspace owner</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, marginLeft: `${sidebarWidth}px`, padding: '1.4rem 1.65rem 2rem', transition: 'margin-left 0.22s ease' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            paddingBottom: '1rem',
            background: 'var(--header-glass-bg)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div
            className="card"
            style={{
              padding: '0.95rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {currentMeta.eyebrow}
              </div>
              <div style={{ marginTop: '0.12rem', fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.04em' }}>
                {currentMeta.title}
              </div>
              <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '680px' }}>
                {currentMeta.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
              <div className="status-chip muted" style={{ minHeight: '44px', display: 'inline-flex', alignItems: 'center', paddingInline: '0.8rem' }}>
                Step {activeStep}/3
              </div>
              <button
                className="btn btn-outline"
                onClick={onToggleTheme}
                style={{ width: '44px', minHeight: '44px', padding: 0 }}
                aria-label={nextThemeLabel}
                title={nextThemeLabel}
              >
                <ThemeIcon size={18} />
              </button>
              <a href={publicPagePath} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ gap: '0.45rem' }}>
                <Globe size={16} />
                Preview booking page
              </a>
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
