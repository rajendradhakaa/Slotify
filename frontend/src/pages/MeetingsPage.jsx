import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Mail, Search, Sparkles, XCircle } from 'lucide-react';
import { differenceInMinutes, format, isToday, isTomorrow } from 'date-fns';
import { bookingsApi, getApiErrorMessage } from '../api';
import useMediaQuery from '../hooks/useMediaQuery';

function parseApiDate(value) {
  if (!value) {
    return new Date();
  }

  const hasTimezone = /([+-]\d{2}:\d{2}|Z)$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

function getDateLabel(date) {
  if (isToday(date)) {
    return 'Today';
  }

  if (isTomorrow(date)) {
    return 'Tomorrow';
  }

  return format(date, 'EEE');
}

export default function MeetingsPage() {
  const isCompact = useMediaQuery('(max-width: 900px)');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState(null);
  
  useEffect(() => {
    let ignore = false;

    const loadMeetings = async () => {
      setLoading(true);
      try {
        const isUpcoming = activeTab === 'upcoming';
        const data = await bookingsApi.getAll(isUpcoming);
        data.sort((a, b) => {
          const dateA = parseApiDate(a.start_time).getTime();
          const dateB = parseApiDate(b.start_time).getTime();
          return isUpcoming ? dateA - dateB : dateB - dateA;
        });

        if (!ignore) {
          setMeetings(data);
        }
      } catch (error) {
        console.error('Error fetching meetings:', error);
        if (!ignore) {
          setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Could not load meetings.') });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadMeetings();

    return () => {
      ignore = true;
    };
  }, [activeTab]);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setFeedback(null), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const handleCancel = async (id) => {
    if (window.confirm('Are you confirm to cancel this scheduled meeting?')) {
      try {
        await bookingsApi.cancel(id);
        setMeetings((currentMeetings) =>
          currentMeetings.map((meeting) =>
            meeting.id === id ? { ...meeting, status: 'cancelled' } : meeting
          )
        );
        setFeedback({ type: 'success', message: 'Meeting cancelled.' });
      } catch (error) {
        setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Could not cancel meeting.') });
      }
    }
  };

  const filteredMeetings = useMemo(() => {
    const searchValue = searchQuery.trim().toLowerCase();
    if (!searchValue) {
      return meetings;
    }

    return meetings.filter((meeting) => (
      meeting.invitee_name.toLowerCase().includes(searchValue) ||
      meeting.invitee_email.toLowerCase().includes(searchValue) ||
      (meeting.event_type_name || '').toLowerCase().includes(searchValue)
    ));
  }, [meetings, searchQuery]);

  const scheduledCount = filteredMeetings.filter((meeting) => meeting.status === 'scheduled').length;
  const cancelledCount = filteredMeetings.filter((meeting) => meeting.status === 'cancelled').length;
  const totalHours = filteredMeetings.reduce((sum, meeting) => (
    sum + differenceInMinutes(parseApiDate(meeting.end_time), parseApiDate(meeting.start_time))
  ), 0) / 60;

  return (
    <div className="dashboard-page">
      {feedback ? (
        <div className={`toast-banner ${feedback.type === 'error' ? 'error' : ''}`}>
          <Sparkles size={16} />
          {feedback.message}
        </div>
      ) : null}

      <section className="page-hero">
        <div className="eyebrow">
          <Calendar size={14} />
          Meetings
        </div>
        <h1 className="hero-title">Keep your conversations organized after the booking</h1>
        <p className="hero-copy">
          Scan what is coming up, review the past, and take action on scheduled meetings without losing context.
        </p>
      </section>

      <div className="metrics-grid">
        <div className="section-card metric-card">
          <span className="metric-label">{activeTab === 'upcoming' ? 'Upcoming meetings' : 'Past meetings'}</span>
          <div className="metric-value">{filteredMeetings.length}</div>
        </div>
        <div className="section-card metric-card">
          <span className="metric-label">Scheduled</span>
          <div className="metric-value">{scheduledCount}</div>
        </div>
        <div className="section-card metric-card">
          <span className="metric-label">Cancelled</span>
          <div className="metric-value">{cancelledCount}</div>
        </div>
        <div className="section-card metric-card">
          <span className="metric-label">Time on calendar</span>
          <div className="metric-value">{totalHours.toFixed(1)}h</div>
        </div>
      </div>

      <section className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="toolbar-row">
          <div className="segmented-control">
            <button
              type="button"
              className={`segmented-button ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
            </button>
            <button
              type="button"
              className={`segmented-button ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              Past
            </button>
          </div>

          <div style={{ position: 'relative', width: isCompact ? '100%' : '320px' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by invitee, email, or event"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.8rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[1, 2, 3].map((item) => (
              <div key={item} className="skeleton" style={{ height: '170px' }} />
            ))}
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="empty-state section-card">
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '20px',
                background: 'var(--surface-tint)',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={28} color="var(--primary)" />
            </div>
            <h3 style={{ fontFamily: 'Manrope, Inter, sans-serif', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              No {activeTab} meetings yet
            </h3>
            <p className="helper-copy" style={{ maxWidth: '460px', margin: '0.75rem auto 0' }}>
              When people book your public event types, each meeting will show up here with its invitee details and status.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredMeetings.map((meeting) => {
              const startDate = parseApiDate(meeting.start_time);
              const endDate = parseApiDate(meeting.end_time);
              const createdDate = parseApiDate(meeting.created_at);
              const isCancelled = meeting.status === 'cancelled';

              return (
                <article
                  key={meeting.id}
                  className="section-card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    borderColor: isCancelled ? 'rgba(217, 48, 37, 0.12)' : 'rgba(20, 87, 255, 0.12)',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '132px minmax(0, 1fr)' }}>
                    <div
                      style={{
                        padding: '1.25rem',
                        background: isCancelled ? 'rgba(217, 48, 37, 0.05)' : 'rgba(20, 87, 255, 0.05)',
                        borderRight: isCompact ? 'none' : '1px solid rgba(22, 37, 79, 0.08)',
                        borderBottom: isCompact ? '1px solid rgba(22, 37, 79, 0.08)' : 'none',
                        display: 'flex',
                        flexDirection: isCompact ? 'row' : 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: isCompact ? '0.9rem' : '0.3rem',
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {format(startDate, 'MMM')}
                      </div>
                      <div style={{ fontFamily: 'Manrope, Inter, sans-serif', fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>
                        {format(startDate, 'd')}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{getDateLabel(startDate)}</div>
                    </div>

                    <div style={{ padding: '1.25rem' }}>
                      <div className="toolbar-row" style={{ alignItems: 'flex-start', gap: '0.8rem' }}>
                        <div>
                          <div className={`status-chip ${isCancelled ? 'muted' : 'success'}`}>
                            {isCancelled ? 'Cancelled' : 'Scheduled'}
                          </div>
                          <h3
                            style={{
                              marginTop: '0.9rem',
                              fontFamily: 'Manrope, Inter, sans-serif',
                              fontSize: '1.3rem',
                              fontWeight: 800,
                              letterSpacing: '-0.03em',
                            }}
                          >
                            {meeting.invitee_name}
                          </h3>
                          <p className="helper-copy" style={{ marginTop: '0.25rem' }}>
                            {meeting.event_type_name || `Event ${meeting.event_type_id}`}
                          </p>
                        </div>

                        {activeTab === 'upcoming' && !isCancelled ? (
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => handleCancel(meeting.id)}
                            style={{ color: 'var(--danger)', minHeight: '40px', paddingInline: 0, gap: '0.45rem' }}
                          >
                            <XCircle size={16} />
                            Cancel meeting
                          </button>
                        ) : null}
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isCompact ? '1fr' : 'repeat(3, minmax(0, 1fr))',
                          gap: '0.85rem',
                          marginTop: '1rem',
                        }}
                      >
                        <div style={{ padding: '0.95rem', borderRadius: '18px', background: 'var(--surface-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.84rem', fontWeight: 700 }}>
                            <Clock size={15} />
                            Time
                          </div>
                          <div style={{ marginTop: '0.4rem', fontWeight: 700 }}>
                            {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                          </div>
                        </div>
                        <div style={{ padding: '0.95rem', borderRadius: '18px', background: 'var(--surface-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.84rem', fontWeight: 700 }}>
                            <Mail size={15} />
                            Invitee
                          </div>
                          <a href={`mailto:${meeting.invitee_email}`} style={{ marginTop: '0.4rem', display: 'inline-block', fontWeight: 700, textDecoration: 'underline' }}>
                            {meeting.invitee_email}
                          </a>
                        </div>
                        <div style={{ padding: '0.95rem', borderRadius: '18px', background: 'var(--surface-muted)' }}>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', fontWeight: 700 }}>
                            Logged
                          </div>
                          <div style={{ marginTop: '0.4rem', fontWeight: 700 }}>
                            {format(createdDate, "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
