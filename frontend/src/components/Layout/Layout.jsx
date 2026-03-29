import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Link as LinkIcon,
  Plus,
  HelpCircle,
  Bell,
  ChevronDown
} from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: 'Scheduling', path: '/event-types', icon: LinkIcon },
    { name: 'Meetings', path: '/meetings', icon: Calendar },
    { name: 'Availability', path: '/availability', icon: Clock },
  ];

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

        {/* Create Button Container */}
        <div style={{ padding: '0 1.25rem 1.5rem' }}>
          <button style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '40px',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 500,
            fontSize: '1rem',
            transition: 'all 0.2s',
            background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <Plus size={20} />
            <span>Create</span>
          </button>
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
