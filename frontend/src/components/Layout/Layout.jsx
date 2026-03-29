import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Bell,
  Calendar,
  ChevronDown,
  Clock,
  ExternalLink,
  Globe,
  HelpCircle,
  Link as LinkIcon,
  Sparkles
} from 'lucide-react';
import useMediaQuery from '../../hooks/useMediaQuery';

const navItems = [
  { name: 'Scheduling', path: '/event-types', icon: LinkIcon },
  { name: 'Meetings', path: '/meetings', icon: Calendar },
  { name: 'Availability', path: '/availability', icon: Clock },
];

const pageMeta = {
  '/event-types': {
    eyebrow: 'Scheduling hub',
    title: 'Shape your live booking menu',
    description: 'Create focused event types, control what goes public, and give every booking link a clear purpose.',
  },
  '/meetings': {
    eyebrow: 'Pipeline',
    title: 'Track every scheduled conversation',
    description: 'Keep upcoming calls, cancellations, and recent activity in one calmer view.',
  },
  '/availability': {
    eyebrow: 'Hours',
    title: 'Tune the times people can book',
    description: 'Set a dependable weekly rhythm and keep your booking links aligned with your real calendar.',
  },
};

function getCurrentPage(pathname) {
  const matchedNav = navItems.find((item) => pathname.startsWith(item.path)) ?? navItems[0];
  return pageMeta[matchedNav.path];
}

function BrandLockup() {
  return (
    <Link to="/event-types" style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #4a82ff 0%, #1457ff 58%, #ff8a3d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'Manrope, Inter, sans-serif',
          fontSize: '1.1rem',
          fontWeight: 800,
          boxShadow: '0 14px 28px rgba(20, 87, 255, 0.24)',
        }}
      >
        S
      </div>
      <div>
        <div style={{ fontFamily: 'Manrope, Inter, sans-serif', fontSize: '1.18rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
          Slotify
        </div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.64)' }}>Premium scheduling workspace</div>
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
            zIndex: 50,
            padding: '1rem 1rem 0',
            background: 'linear-gradient(180deg, rgba(247, 249, 255, 0.94) 0%, rgba(247, 249, 255, 0.78) 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            className="card"
            style={{
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #4a82ff 0%, #1457ff 58%, #ff8a3d 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontFamily: 'Manrope, Inter, sans-serif',
                    fontWeight: 800,
                  }}
                >
                  S
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {currentMeta.eyebrow}
                  </div>
                  <div style={{ fontFamily: 'Manrope, Inter, sans-serif', fontSize: '1.08rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    {currentMeta.title}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <a
                href={publicPagePath}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ minHeight: '40px', padding: '0.55rem 0.85rem' }}
                aria-label="Open public booking page"
              >
                <Globe size={16} />
              </a>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(20, 87, 255, 0.14), rgba(255, 138, 61, 0.18))',
                  color: 'var(--text-primary)',
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

        <main style={{ padding: '0 1rem calc(6.15rem + env(safe-area-inset-bottom))' }}>
          <Outlet />
        </main>

        <nav
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 60,
            display: 'grid',
            gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))`,
            gap: '0.55rem',
            padding: '0.75rem 1rem calc(0.85rem + env(safe-area-inset-bottom))',
            background: 'rgba(250, 251, 255, 0.94)',
            backdropFilter: 'blur(18px)',
            borderTop: '1px solid rgba(22, 37, 79, 0.08)',
            boxShadow: '0 -20px 42px rgba(16, 25, 54, 0.12)',
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
                  gap: '0.38rem',
                  padding: '0.7rem 0.45rem',
                  borderRadius: '18px',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(20, 87, 255, 0.08)' : 'transparent',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.72rem',
                }}
              >
                <item.icon size={18} />
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
          background:
            'radial-gradient(circle at top, rgba(74, 130, 255, 0.26), transparent 32%), linear-gradient(180deg, rgba(10, 19, 45, 0.98) 0%, rgba(7, 14, 34, 0.97) 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '20px 0 48px rgba(11, 20, 47, 0.12)',
          zIndex: 40,
        }}
      >
        <BrandLockup />

        <div
          style={{
            padding: '1.15rem',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div className="status-chip success" style={{ background: 'rgba(21, 153, 87, 0.18)', color: '#89f4b7' }}>
            <Sparkles size={14} />
            Booking page live
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '1rem' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 138, 61, 0.22))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Manrope, Inter, sans-serif',
                fontWeight: 800,
                fontSize: '1.1rem',
              }}
            >
              R
            </div>
            <div>
              <div style={{ fontFamily: 'Manrope, Inter, sans-serif', fontSize: '1rem', fontWeight: 700 }}>Rajendra Dhaka</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.68)' }}>Founder calendar</div>
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.92rem 1rem',
                  borderRadius: '18px',
                  background: isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent'}`,
                  color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
                  <item.icon size={18} />
                  {item.name}
                </span>
                {isActive ? (
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#89f4b7' }} />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            marginTop: 'auto',
            padding: '1.15rem',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.62)', fontWeight: 700 }}>
            Public page
          </div>
          <p style={{ marginTop: '0.7rem', color: 'rgba(255, 255, 255, 0.76)', lineHeight: 1.6, fontSize: '0.92rem' }}>
            Open the live profile, sanity check your links, and share your booking page without leaving the workspace.
          </p>
          <a
            href={publicPagePath}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-light"
            style={{ width: '100%', justifyContent: 'space-between', marginTop: '1rem' }}
          >
            View live profile
            <ExternalLink size={16} />
          </a>
        </div>
      </aside>

      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', padding: '1.5rem 1.75rem 2.25rem' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            paddingBottom: '1rem',
            background: 'linear-gradient(180deg, rgba(247, 249, 255, 0.94) 0%, rgba(247, 249, 255, 0.7) 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            className="card"
            style={{
              padding: '1rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {currentMeta.eyebrow}
              </div>
              <div style={{ fontFamily: 'Manrope, Inter, sans-serif', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.04em', marginTop: '0.15rem' }}>
                {currentMeta.title}
              </div>
              <p style={{ marginTop: '0.3rem', color: 'var(--text-secondary)', maxWidth: '700px', fontSize: '0.92rem' }}>
                {currentMeta.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexShrink: 0 }}>
              <a href={publicPagePath} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ gap: '0.55rem' }}>
                <Globe size={16} />
                View live page
              </a>
              <button className="btn btn-outline" style={{ minWidth: '46px', paddingInline: '0.9rem' }} aria-label="Help">
                <HelpCircle size={18} />
              </button>
              <button className="btn btn-outline" style={{ minWidth: '46px', paddingInline: '0.9rem' }} aria-label="Notifications">
                <Bell size={18} />
              </button>
              <div
                className="card"
                style={{
                  padding: '0.35rem 0.45rem 0.35rem 0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  minWidth: 'fit-content',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(20, 87, 255, 0.14), rgba(255, 138, 61, 0.18))',
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
