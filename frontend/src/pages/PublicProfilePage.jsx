import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, Calendar } from 'lucide-react';
import { eventTypesApi } from '../api';
import useMediaQuery from '../hooks/useMediaQuery';

export default function PublicProfilePage() {
  const isCompact = useMediaQuery('(max-width: 700px)');
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const data = await eventTypesApi.getAll();
        // Filter to only show active event types if applicable
        setEventTypes(data);
      } catch (error) {
        console.error('Error fetching event types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventTypes();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-page)' }}>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: isCompact ? '2.5rem 1rem' : '4rem 1rem' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        {/* Profile Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: '#e9ecef', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 auto 1.5rem',
            border: '4px solid white',
            boxShadow: 'var(--shadow-sm)'
          }}>R</div>
          <h1 style={{ fontSize: isCompact ? '1.7rem' : '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Rajendra Dhaka</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: isCompact ? '1rem' : '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
            Welcome to my scheduling page. Please select an event below to book a time with me.
          </p>
        </div>

        {/* Event Types Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {eventTypes.map((event) => (
            <div 
              key={event.id}
              onClick={() => navigate(`/book/${event.slug}`)}
              className="card"
              style={{ 
                padding: '1.5rem', 
                cursor: 'pointer', 
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '180px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              {/* Top Accent Color Bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--primary)' }}></div>
              
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{event.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '0.5rem' }}>
                  <Clock size={16} />
                  <span>{event.duration} mins</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                  <Calendar size={16} />
                  <span>One-on-One</span>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9375rem' }}>
                <span>View availability</span>
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
          
          {eventTypes.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', border: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No public events available at the moment.</p>
            </div>
          )}
        </div>
        
        {/* Footer Branding */}
        <div style={{ textAlign: 'center', marginTop: '5rem', opacity: 0.6 }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Powered by <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Slotify</span>
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
