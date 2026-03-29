import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Clock, Globe } from 'lucide-react';
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
        setEventTypes(data);
      } catch (error) {
        console.error('Error fetching event types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventTypes();
  }, []);

  const publicEvents = eventTypes.filter((event) => event.is_active);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', padding: isCompact ? '1.2rem' : '2rem' }}>
        <div className="skeleton" style={{ maxWidth: '960px', height: '240px', margin: '0 auto 1rem' }} />
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gap: '1rem', gridTemplateColumns: isCompact ? '1fr' : 'repeat(3, minmax(0, 1fr))' }}>
          {[1, 2, 3].map((item) => (
            <div key={item} className="skeleton" style={{ height: '220px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: isCompact ? '1.2rem 1rem 2rem' : '2rem 1rem 3rem' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <section className="section-card" style={{ display: 'grid', gap: '0.65rem' }}>
          <h1 style={{ fontFamily: 'Syne, DM Sans, sans-serif', fontSize: isCompact ? '1.5rem' : '1.85rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
            Book time with Rajendra Dhaka
          </h1>
          <p className="helper-copy">
            Choose a session below. You will select date, time, and confirm in one flow.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span className="status-chip muted">
              <Clock size={14} />
              Asia/Kolkata
            </span>
            <span className="status-chip success">
              <Globe size={14} />
              {publicEvents.length} live event types
            </span>
          </div>
        </section>

        <section className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="toolbar-row">
            <div>
              <h2 style={{ fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                Available sessions
              </h2>
              <p className="helper-copy" style={{ marginTop: '0.3rem' }}>
                Every live option below opens the booking calendar right away.
              </p>
            </div>
            <span className="status-chip success">{publicEvents.length} live options</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {publicEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => navigate(`/book/${event.slug}`)}
                className="section-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  textAlign: 'left',
                  alignItems: 'stretch',
                  background: 'var(--bg-content)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{ height: '7px', background: event.color || 'var(--primary)' }} />
                <div style={{ padding: '1.35rem' }}>
                  <div className="status-chip muted" style={{ background: `${event.color || '#1457FF'}14`, color: event.color || 'var(--primary)' }}>
                    Live booking
                  </div>
                  <h3
                    style={{
                      marginTop: '1rem',
                      fontFamily: 'Syne, DM Sans, sans-serif',
                      fontSize: '1.28rem',
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {event.name}
                  </h3>

                  <div style={{ display: 'grid', gap: '0.7rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)' }}>
                      <Clock size={16} />
                      {event.duration} minute session
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={16} />
                      One-on-one booking flow
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '1.35rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontWeight: 700,
                      color: event.color || 'var(--primary)',
                    }}
                  >
                    <span>View availability</span>
                    <ChevronRight size={18} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {publicEvents.length === 0 ? (
            <div className="empty-state">
              <h3 style={{ fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                No public event types are live right now
              </h3>
              <p className="helper-copy" style={{ maxWidth: '480px', margin: '0.75rem auto 0' }}>
                The dashboard still has booking links, but they are currently hidden from the public page until they are ready to be shared.
              </p>
            </div>
          ) : null}
        </section>

        <div style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.72 }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Powered by <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Slotify</span>
          </p>
        </div>
      </div>
    </div>
  );
}
