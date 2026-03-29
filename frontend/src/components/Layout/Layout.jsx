import { Link, Outlet, useLocation } from 'react-router-dom';
import { Bell, Calendar, ChevronDown, Clock, Globe, HelpCircle, Link as LinkIcon } from 'lucide-react';
import useMediaQuery from '../../hooks/useMediaQuery';

const navItems = [
  { name: 'Event Types', path: '/event-types', icon: LinkIcon },
  { name: 'Meetings', path: '/meetings', icon: Calendar },
  { name: 'Availability', path: '/availability', icon: Clock },
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

function getCurrentPage(pathname) {
  const matchedNav = navItems.find((item) => pathname.startsWith(item.path)) ?? navItems[0];
  return pageMeta[matchedNav.path];
}

function BrandLockup() {
  return (
    <Link to="/event-types" style={{ display: 'flex', alignItems: 'center', gap: '0.95rem' }}>
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
      <div>
        <div style={{ fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.12rem', fontWeight: 700, letterSpacing: '-0.04em' }}>
          Slotify
        </div>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.58)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Calendar system
        </div>
      </div>
    </Link>
  );
}

export default function Layout() {
  const location = useLocation();
  const isCompact = useMediaQuery('(max-width: 960px)');
  const currentMeta = getCurrentPage(location.pathname);
  const publicPagePath = '/u/rajendradhaka';

  if (isCompact) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            padding: '1rem 1rem 0',
            background: 'rgba(250, 246, 238, 0.88)',
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
            gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))`,
            gap: '0.45rem',
            padding: '0.75rem 1rem calc(0.85rem + env(safe-area-inset-bottom))',
            background: 'rgba(255, 251, 245, 0.92)',
            backdropFilter: 'blur(18px)',
            borderTop: '1px solid var(--border)',
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
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
                }}
              >
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
          width: 'var(--sidebar-width)',
          position: 'fixed',
          inset: 0,
          padding: '1.5rem',
          background: 'linear-gradient(180deg, #181a20 0%, #12141a 100%)',
          color: '#f7f1e7',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.35rem',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 30,
        }}
      >
        <BrandLockup />

        <div
          style={{
            padding: '1.1rem',
            borderRadius: '18px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.04)',
          }}
        >
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.52)' }}>
            Public page
          </div>
          <div style={{ marginTop: '0.7rem', fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.04em' }}>
            Rajendra Dhaka
          </div>
          <p style={{ marginTop: '0.55rem', color: 'rgba(255, 255, 255, 0.66)', lineHeight: 1.6, fontSize: '0.92rem' }}>
            The same event types you edit here show up on the public booking page.
          </p>
          <a
            href={publicPagePath}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-light"
            style={{ width: '100%', marginTop: '1rem', justifyContent: 'space-between' }}
          >
            Open public page
            <Globe size={16} />
          </a>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {navItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px minmax(0, 1fr) 18px',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 0.95rem',
                  borderRadius: '16px',
                  border: `1px solid ${isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent'}`,
                  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.72)',
                }}
              >
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  0{index + 1}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontWeight: 700 }}>
                  <item.icon size={17} />
                  {item.name}
                </span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.18)' }} />
              </Link>
            );
          })}
        </nav>

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
            <div>
              <div style={{ fontWeight: 700 }}>Rajendra Dhaka</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.56)', fontSize: '0.84rem' }}>Workspace owner</div>
            </div>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', padding: '1.4rem 1.65rem 2rem' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            paddingBottom: '1rem',
            background: 'rgba(250, 246, 238, 0.88)',
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
              <a href={publicPagePath} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ gap: '0.45rem' }}>
                <Globe size={16} />
                Public page
              </a>
              <button className="btn btn-outline" style={{ width: '44px', minHeight: '44px', padding: 0 }} aria-label="Help">
                <HelpCircle size={18} />
              </button>
              <button className="btn btn-outline" style={{ width: '44px', minHeight: '44px', padding: 0 }} aria-label="Notifications">
                <Bell size={18} />
              </button>
              <div
                className="card"
                style={{
                  padding: '0.3rem 0.35rem 0.3rem 0.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '11px',
                    background: 'var(--surface-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  R
                </div>
                <ChevronDown size={16} color="var(--text-secondary)" />
              </div>
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
