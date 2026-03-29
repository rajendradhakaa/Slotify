import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { bookingsApi, getApiErrorMessage } from '../api';
import useMediaQuery from '../hooks/useMediaQuery';

function formatDateTime(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export default function ConfirmationPage() {
  const { bookingId } = useParams();
  const isCompact = useMediaQuery('(max-width: 900px)');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadBooking = async () => {
      try {
        const data = await bookingsApi.getById(bookingId);
        if (!ignore) {
          setBooking(data);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(getApiErrorMessage(requestError, 'Confirmation details are not available right now.'));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadBooking();

    return () => {
      ignore = true;
    };
  }, [bookingId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="skeleton" style={{ width: '100%', maxWidth: '700px', height: '320px' }} />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="section-card empty-state" style={{ width: '100%', maxWidth: '700px' }}>
          <h1 style={{ fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.04em' }}>Unable to open confirmation</h1>
          <p className="helper-copy" style={{ marginTop: '0.75rem' }}>{error || 'This confirmation link may be invalid or expired.'}</p>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/event-types" className="btn btn-outline">Back to dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="section-card" style={{ width: '100%', maxWidth: '760px', padding: isCompact ? '1.4rem' : '2rem' }}>
        <div className="status-chip success">
          <CheckCircle size={14} />
          Confirmed
        </div>

        <h1 style={{ marginTop: '0.9rem', fontFamily: 'Syne, DM Sans, sans-serif', fontSize: isCompact ? '1.6rem' : '2rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
          Meeting confirmation
        </h1>

        <p className="helper-copy" style={{ marginTop: '0.45rem' }}>
          Your booking is confirmed and recorded successfully.
        </p>

        <div style={{ marginTop: '1.1rem', padding: '1rem', borderRadius: '16px', background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{booking.event_type_name || 'Scheduled meeting'}</div>
          <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: 'var(--text-secondary)' }}>
              <Calendar size={16} />
              {formatDateTime(booking.start_time)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: 'var(--text-secondary)' }}>
              <Clock size={16} />
              Duration: {booking.event_type_duration || '-'} minutes
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <Link to="/event-types" className="btn btn-outline">Go to dashboard</Link>
          <Link to="/u/rajendradhaka" className="btn btn-primary">Open booking page</Link>
        </div>
      </div>
    </div>
  );
}
