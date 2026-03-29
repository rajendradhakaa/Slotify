import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Calendar,
  CalendarPlus,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Sparkles,
} from 'lucide-react';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { availabilityApi, bookingsApi, eventTypesApi, getApiErrorMessage } from '../api';
import useMediaQuery from '../hooks/useMediaQuery';

function parseApiDate(value) {
  if (!value) {
    return new Date();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'number') {
    return new Date(value);
  }

  const hasTimezone = /([+-]\d{2}:\d{2}|Z)$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

function formatInTimezone(value, timeZone, options) {
  return new Intl.DateTimeFormat('en-US', { timeZone, ...options }).format(parseApiDate(value));
}

export default function BookingPage() {
  const { slug } = useParams();
  const isCompact = useMediaQuery('(max-width: 960px)');
  const isNarrow = useMediaQuery('(max-width: 640px)');

  const [eventType, setEventType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [userTimezone, setUserTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');

  const uniqueTimezones = useMemo(() => (
    [
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Asia/Kolkata',
      'Asia/Tokyo',
      'Australia/Sydney',
      'UTC',
    ].filter(Boolean).filter((item, index, array) => array.indexOf(item) === index)
  ), []);

  useEffect(() => {
    let ignore = false;

    const loadEventType = async () => {
      try {
        const data = await eventTypesApi.getBySlug(slug);
        if (!ignore) {
          setEventType(data);
        }
      } catch (requestError) {
        if (!ignore) {
          setError('This booking link is unavailable right now.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadEventType();

    const storedBooking = sessionStorage.getItem(`booking_${slug}`);
    if (storedBooking) {
      setBookingResult(JSON.parse(storedBooking));
    }

    return () => {
      ignore = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!selectedDate || !eventType) {
      setAvailableSlots([]);
      setSelectedTimeSlot(null);
      return;
    }

    let ignore = false;

    const loadSlots = async () => {
      setLoadingSlots(true);
      setSelectedTimeSlot(null);
      setBookingError('');
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const data = await availabilityApi.getSlots(slug, dateStr);
        if (!ignore) {
          setAvailableSlots(data.slots || []);
        }
      } catch (requestError) {
        if (!ignore) {
          setAvailableSlots([]);
          setBookingError('Could not load available slots for that day.');
        }
      } finally {
        if (!ignore) {
          setLoadingSlots(false);
        }
      }
    };

    loadSlots();

    return () => {
      ignore = true;
    };
  }, [eventType, selectedDate, slug]);

  const formatFullDate = (value) => formatInTimezone(value, userTimezone, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formatShortDate = (value) => formatInTimezone(value, userTimezone, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const formatTime = (value) => formatInTimezone(value, userTimezone, {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  const handleSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
    setBookingError('');
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedTimeSlot || !eventType) {
      return;
    }

    setBookingStatus('submitting');
    setBookingError('');

    try {
      const response = await bookingsApi.create({
        event_type_id: eventType.id,
        invitee_name: formData.name,
        invitee_email: formData.email,
        start_time: selectedTimeSlot.datetime_utc,
      });

      sessionStorage.setItem(`booking_${slug}`, JSON.stringify(response));
      setBookingResult(response);
      setBookingStatus('success');
    } catch (requestError) {
      setBookingStatus('idle');
      setBookingError(getApiErrorMessage(requestError, 'This time slot is no longer available. Please choose another time.'));
      setSelectedTimeSlot(null);
      setSelectedDate((currentValue) => (currentValue ? new Date(currentValue) : currentValue));
    }
  };

  const resetBooking = () => {
    setBookingStatus('idle');
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setFormData({ name: '', email: '' });
    setBookingError('');
  };

  const makeGCalUrl = () => {
    if (!bookingResult || !eventType) {
      return '#';
    }

    const start = parseApiDate(bookingResult.start_time);
    const end = parseApiDate(bookingResult.end_time);
    const formatGoogleDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const text = encodeURIComponent(`Meeting with Rajendra Dhaka: ${eventType.name}`);
    return `https://calendar.google.com/calendar/r/eventedit?text=${text}&dates=${formatGoogleDate(start)}/${formatGoogleDate(end)}`;
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const rangeStart = startOfWeek(monthStart);
    const rangeEnd = endOfWeek(monthEnd);
    const today = startOfDay(new Date());
    const rows = [];
    let cells = [];
    let day = rangeStart;

    rows.push(
      <div className="calendar-grid-header" key="calendar-header">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((header) => (
          <div className="calendar-day-header" key={header}>
            {header}
          </div>
        ))}
      </div>
    );

    while (day <= rangeEnd) {
      for (let i = 0; i < 7; i += 1) {
        const cloneDay = day;
        const isPast = isBefore(day, today);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isDisabled = isPast || !isCurrentMonth;

        cells.push(
          <div
            key={day.toISOString()}
            className={`calendar-cell ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
            onClick={() => {
              if (!isDisabled) {
                setSelectedDate(cloneDay);
              }
            }}
          >
            <span className="calendar-number">{format(day, 'd')}</span>
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div className="calendar-row" key={day.toISOString()}>
          {cells}
        </div>
      );
      cells = [];
    }

    return <div>{rows}</div>;
  };

  if (loading) {
    return (
      <div style={{ padding: isCompact ? '1rem' : '2rem', minHeight: '100vh' }}>
        <div className="skeleton" style={{ maxWidth: '1180px', height: '640px', margin: '0 auto' }} />
      </div>
    );
  }

  if (error || !eventType) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="section-card empty-state" style={{ maxWidth: '540px' }}>
          <h2 style={{ fontFamily: 'Manrope, Inter, sans-serif', fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            {error || 'Booking link not found'}
          </h2>
          <p className="helper-copy" style={{ marginTop: '0.75rem' }}>
            This event may have been removed, hidden from the public page, or the URL was entered incorrectly.
          </p>
        </div>
      </div>
    );
  }

  if (bookingStatus === 'success') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isCompact ? '1rem' : '2rem' }}>
        <div className="section-card" style={{ width: '100%', maxWidth: '680px', textAlign: 'center', padding: isNarrow ? '1.5rem' : '2.3rem' }}>
          <CheckCircle size={70} color="var(--success)" style={{ margin: '0 auto 1.25rem' }} />
          <h1 style={{ fontFamily: 'Manrope, Inter, sans-serif', fontSize: isNarrow ? '1.7rem' : '2rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
            You are booked
          </h1>
          <p className="helper-copy" style={{ marginTop: '0.7rem', maxWidth: '520px', marginInline: 'auto' }}>
            Your booking is confirmed. If email is configured, a confirmation message is on the way too.
          </p>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.2rem',
              borderRadius: '24px',
              background: 'var(--surface-muted)',
              border: '1px solid rgba(22, 37, 79, 0.08)',
              textAlign: 'left',
            }}
          >
            <div className="status-chip success">Confirmed</div>
            <h2 style={{ marginTop: '0.9rem', fontFamily: 'Manrope, Inter, sans-serif', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              {eventType.name}
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-secondary)' }}>
                <Calendar size={16} />
                {formatFullDate(bookingResult.start_time)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-secondary)' }}>
                <Clock size={16} />
                {formatTime(bookingResult.start_time)} - {formatTime(bookingResult.end_time)} ({userTimezone})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-secondary)' }}>
                <Globe size={16} />
                Booking for {formData.name || bookingResult.invitee_name}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <a href={makeGCalUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ gap: '0.5rem' }}>
              <CalendarPlus size={18} />
              Add to Google Calendar
            </a>
            <button type="button" className="btn btn-outline" onClick={resetBooking}>
              Book another time
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: isCompact ? '1rem' : '2rem' }}>
      <div
        className="card"
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: isCompact ? '1fr' : '320px minmax(0, 1fr)',
        }}
      >
        <aside
          style={{
            padding: isNarrow ? '1.25rem' : '1.6rem',
            borderRight: isCompact ? 'none' : '1px solid rgba(22, 37, 79, 0.08)',
            borderBottom: isCompact ? '1px solid rgba(22, 37, 79, 0.08)' : 'none',
            background:
              'radial-gradient(circle at top left, rgba(20, 87, 255, 0.12), transparent 45%), linear-gradient(180deg, rgba(244, 247, 255, 0.96) 0%, rgba(255, 255, 255, 0.94) 100%)',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #4a82ff 0%, #1457ff 58%, #ff8a3d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontFamily: 'Manrope, Inter, sans-serif',
              fontWeight: 800,
              fontSize: '1.2rem',
              boxShadow: '0 16px 30px rgba(20, 87, 255, 0.2)',
            }}
          >
            R
          </div>

          <div className="status-chip" style={{ marginTop: '1rem' }}>
            <Sparkles size={14} />
            Live booking page
          </div>
          <div style={{ marginTop: '1.1rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Rajendra Dhaka</div>
          <h1 style={{ marginTop: '0.35rem', fontFamily: 'Manrope, Inter, sans-serif', fontSize: isNarrow ? '1.6rem' : '1.95rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
            {eventType.name}
          </h1>
          <p className="helper-copy" style={{ marginTop: '0.75rem' }}>
            Choose a date, pick a real available slot, then confirm the booking with your details.
          </p>

          <div style={{ display: 'grid', gap: '0.8rem', marginTop: '1.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <Clock size={17} />
              {eventType.duration} minute session
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <Globe size={17} />
              Times shown in {userTimezone}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '22px', background: 'rgba(20, 87, 255, 0.06)', border: '1px solid rgba(20, 87, 255, 0.12)' }}>
            <div style={{ fontWeight: 700 }}>Your progress</div>
            <div className="stat-line">
              <span>Date selected</span>
              <strong>{selectedDate ? 'Done' : 'Choose one'}</strong>
            </div>
            <div className="stat-line">
              <span>Time selected</span>
              <strong>{selectedTimeSlot ? 'Done' : 'Choose one'}</strong>
            </div>
            <div className="stat-line">
              <span>Details submitted</span>
              <strong>{bookingResult ? 'Done' : 'Pending'}</strong>
            </div>
          </div>

          {(selectedDate && selectedTimeSlot) ? (
            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '22px', background: 'white', border: '1px solid rgba(22, 37, 79, 0.08)' }}>
              <div style={{ fontWeight: 700 }}>Selected slot</div>
              <p className="helper-copy" style={{ marginTop: '0.45rem' }}>
                {formatFullDate(selectedTimeSlot.datetime_utc)}
              </p>
              <div style={{ marginTop: '0.35rem', fontWeight: 700 }}>
                {formatTime(selectedTimeSlot.datetime_utc)}
              </div>
            </div>
          ) : null}

          <div style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Time zone</label>
            <select
              value={userTimezone}
              onChange={(e) => setUserTimezone(e.target.value)}
              className="form-select"
            >
              {uniqueTimezones.map((timezone) => (
                <option key={timezone} value={timezone}>
                  {timezone}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <main style={{ padding: isNarrow ? '1.1rem' : '1.6rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookingResult ? (
            <div className="toast-banner" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Sparkles size={16} />
                Need your last receipt? Your previous booking is still stored in this browser tab.
              </div>
              <button type="button" className="btn btn-outline" onClick={() => setBookingStatus('success')} style={{ minHeight: '40px' }}>
                View receipt
              </button>
            </div>
          ) : null}

          <section className="section-card" style={{ padding: '1.2rem' }}>
            <div className="toolbar-row" style={{ alignItems: 'center' }}>
              <div>
                <h2 style={{ fontFamily: 'Manrope, Inter, sans-serif', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                  Choose a date
                </h2>
                <p className="helper-copy" style={{ marginTop: '0.3rem' }}>
                  Start with a day, then pick from the real available slots for that date.
                </p>
              </div>
              <div className="status-chip muted">{selectedDate ? formatShortDate(selectedDate) : 'Step 1'}</div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isCompact ? '1fr' : 'minmax(0, 1.1fr) minmax(280px, 0.9fr)',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >
              <div style={{ padding: '1rem', borderRadius: '22px', background: 'var(--surface-muted)', border: '1px solid rgba(22, 37, 79, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setCurrentDate(subMonths(currentDate, 1))} style={{ minWidth: '46px', paddingInline: '0.8rem' }}>
                    <ChevronLeft size={18} />
                  </button>
                  <div style={{ fontFamily: 'Manrope, Inter, sans-serif', fontSize: isNarrow ? '1.05rem' : '1.15rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    {format(currentDate, 'MMMM yyyy')}
                  </div>
                  <button type="button" className="btn btn-outline" onClick={() => setCurrentDate(addMonths(currentDate, 1))} style={{ minWidth: '46px', paddingInline: '0.8rem' }}>
                    <ChevronRight size={18} />
                  </button>
                </div>
                {renderCalendar()}
              </div>

              <div style={{ padding: '1rem', borderRadius: '22px', background: 'var(--surface-muted)', border: '1px solid rgba(22, 37, 79, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <div className="status-chip">{selectedDate ? 'Step 2' : 'Select a date first'}</div>
                  <h3 style={{ marginTop: '0.9rem', fontFamily: 'Manrope, Inter, sans-serif', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    {selectedDate ? `Available on ${formatShortDate(selectedDate)}` : 'Choose a day to see times'}
                  </h3>
                  <p className="helper-copy" style={{ marginTop: '0.3rem' }}>
                    {selectedDate
                      ? `All times are shown in ${userTimezone}.`
                      : 'Once a day is selected, bookable times appear here automatically.'}
                  </p>
                </div>

                {!selectedDate ? (
                  <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                    <Calendar size={30} color="var(--primary)" style={{ marginBottom: '0.8rem' }} />
                    <p className="helper-copy">Select a date from the calendar to unlock time slots.</p>
                  </div>
                ) : loadingSlots ? (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="skeleton" style={{ height: '54px' }} />
                    ))}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                    <Clock size={30} color="var(--primary)" style={{ marginBottom: '0.8rem' }} />
                    <p className="helper-copy">No open slots on that day. Try a different date to keep the booking moving.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.datetime_utc}
                        type="button"
                        className={`slot-button ${selectedTimeSlot?.datetime_utc === slot.datetime_utc ? 'selected' : ''}`}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        <span>{formatTime(slot.datetime_utc)}</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {eventType.duration} min
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {selectedTimeSlot ? (
            <section className="section-card">
              <div className="toolbar-row">
                <div>
                  <div className="status-chip success">Step 3</div>
                  <h2 style={{ marginTop: '0.85rem', fontFamily: 'Manrope, Inter, sans-serif', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                    Confirm your details
                  </h2>
                  <p className="helper-copy" style={{ marginTop: '0.3rem' }}>
                    You are booking {formatShortDate(selectedTimeSlot.datetime_utc)} at {formatTime(selectedTimeSlot.datetime_utc)}.
                  </p>
                </div>
                <button type="button" className="btn btn-outline" onClick={() => setSelectedTimeSlot(null)}>
                  Change time
                </button>
              </div>

              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  borderRadius: '22px',
                  background: 'var(--surface-muted)',
                  border: '1px solid rgba(22, 37, 79, 0.08)',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <div className="status-chip success">{eventType.name}</div>
                  <div className="status-chip muted">{eventType.duration} minutes</div>
                  <div className="status-chip muted">{formatTime(selectedTimeSlot.datetime_utc)}</div>
                </div>
              </div>

              {bookingError ? (
                <div className="toast-banner error" style={{ marginTop: '1rem' }}>
                  <Sparkles size={16} />
                  {bookingError}
                </div>
              ) : null}

              <form onSubmit={handleBook} style={{ marginTop: '1rem' }}>
                <div className="input-grid">
                  <div className="form-group">
                    <label className="form-label">Your name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData((current) => ({ ...current, name: e.target.value }))}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData((current) => ({ ...current, email: e.target.value }))}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={bookingStatus === 'submitting'}>
                    {bookingStatus === 'submitting' ? 'Scheduling...' : 'Confirm booking'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setSelectedTimeSlot(null)}>
                    Pick another time
                  </button>
                </div>
              </form>
            </section>
          ) : null}
        </main>
      </div>

      <style>{`
        .calendar-grid-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          margin-bottom: 0.55rem;
        }

        .calendar-day-header {
          padding: 0.5rem 0;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.04em;
        }

        .calendar-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.3rem;
          margin-bottom: 0.3rem;
        }

        .calendar-cell {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: white;
          color: var(--text-primary);
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .calendar-cell:hover:not(.disabled) {
          transform: translateY(-1px);
          border-color: rgba(20, 87, 255, 0.18);
          box-shadow: 0 12px 24px rgba(20, 87, 255, 0.08);
        }

        .calendar-cell.disabled {
          color: #b5bed1;
          cursor: default;
          background: rgba(255, 255, 255, 0.55);
        }

        .calendar-cell.selected {
          background: linear-gradient(135deg, #1457ff 0%, #4a82ff 100%);
          color: white;
          box-shadow: 0 14px 26px rgba(20, 87, 255, 0.24);
        }

        @media (max-width: 640px) {
          .calendar-day-header {
            font-size: 0.64rem;
          }

          .calendar-cell {
            border-radius: 14px;
            font-size: 0.92rem;
          }
        }
      `}</style>
    </div>
  );
}
