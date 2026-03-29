import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Link as LinkIcon,
  HelpCircle,
  Bell,
  ChevronDown
} from 'lucide-react';
import useMediaQuery from '../../hooks/useMediaQuery';

export default function Layout() {
  const location = useLocation();
  const isCompact = useMediaQuery('(max-width: 960px)');

  const navItems = [
    { name: 'Scheduling', path: '/event-types', icon: LinkIcon },
    { name: 'Meetings', path: '/meetings', icon: Calendar },
    { name: 'Availability', path: '/availability', icon: Clock },
  ];

  if (isCompact) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link to="/event-types" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'var(--primary)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: 800
            }}>S</div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>Slotify</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Scheduling dashboard</div>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button style={{ color: 'var(--text-secondary)' }}><HelpCircle size={18} /></button>
            <button style={{ color: 'var(--text-secondary)' }}><Bell size={18} /></button>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#e9ecef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-primary)'
            }}>R</div>
          </div>
        </header>

        <main style={{ padding: '1rem 1rem calc(5.75rem + env(safe-area-inset-bottom))' }}>
          <Outlet />
        </main>

        <nav style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 60,
          display: 'grid',
          gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))`,
          gap: '0.5rem',
          padding: '0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom))',
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(18px)',
          borderTop: '1px solid var(--border)',
          boxShadow: '0 -12px 32px rgba(26, 26, 26, 0.08)'
        }}>
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
                  gap: '0.35rem',
                  padding: '0.6rem 0.35rem',
                  borderRadius: '16px',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(0, 107, 255, 0.08)' : 'transparent',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.72rem'
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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* Sidebar */}
      <nav style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 50
      }}>
        {/* Logo Section */}
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--primary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: 800
            }}>S</div>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.025em' }}>Slotify</span>
          </div>
        </div>

        {/* Nav List */}
        <ul style={{ listStyle: 'none', padding: '0 0.75rem', margin: 0 }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.path} style={{ marginBottom: '4px' }}>
                <Link
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 0.5rem',
                    borderRadius: '8px',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    background: isActive ? '#f2f2f2' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.9375rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = isActive ? '#f2f2f2' : '#f9f9f9'}
                  onMouseOut={(e) => e.currentTarget.style.background = isActive ? '#f2f2f2' : 'transparent'}
                >
                  <item.icon size={18} style={{ color: isActive ? 'var(--primary)' : '#737373' }} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <header style={{
          height: '64px',
          background: 'white',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '1.5rem'
        }}>
          <button style={{ color: 'var(--text-secondary)' }}><HelpCircle size={20} /></button>
          <button style={{ color: 'var(--text-secondary)' }}><Bell size={20} /></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#e9ecef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-primary)'
            }}>R</div>
            <ChevronDown size={16} color="var(--text-secondary)" />
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '0 3rem 3rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
