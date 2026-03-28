import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Globe, ChevronLeft, ChevronRight, CheckCircle, CalendarPlus } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, isSameMonth, addDays, isBefore, startOfDay } from 'date-fns';
import { eventTypesApi, availabilityApi, bookingsApi } from '../api';

export default function BookingPage() {
  const { slug } = useParams();
  const [eventType, setEventType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selection state
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Native JS Formatters based on selected timezone
  const fFullDate = (d) => new Intl.DateTimeFormat('en-US', { timeZone: userTimezone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(d));
  const fTime = (d) => new Intl.DateTimeFormat('en-US', { timeZone: userTimezone, hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date(d));
  const fShortDate = (d) => new Intl.DateTimeFormat('en-US', { timeZone: userTimezone, weekday: 'long', month: 'short', day: 'numeric' }).format(new Date(d));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  
  // Timezone state
  const [userTimezone, setUserTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const commonTimezones = [
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "Europe/London", "Europe/Paris", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney", "UTC"
  ];
  const uniqueTimezones = [...new Set(commonTimezones.filter(Boolean))];

  // Slots state
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, submitting, success, error
  const [bookingResult, setBookingResult] = useState(null);
  
  // Real-time validation state
  const [validatingTime, setValidatingTime] = useState(false);
  const [timeError, setTimeError] = useState(null);

  useEffect(() => {
    fetchEventType();
    
    const storedBooking = sessionStorage.getItem(`booking_${slug}`);
    if (storedBooking) {
      setBookingResult(JSON.parse(storedBooking));
      setBookingStatus('success');
    }
  }, [slug]);

  useEffect(() => {
    if (selectedDate && eventType) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, eventType]);

  const fetchEventType = async () => {
    try {
      const data = await eventTypesApi.getBySlug(slug);
      setEventType(data);
    } catch (error) {
      setError('Event type not found or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (date) => {
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedTimeSlot(null);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const data = await availabilityApi.getSlots(slug, dateStr);
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingStatus('submitting');
    
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
    } catch (error) {
      setBookingStatus('error');
      alert(error.response?.data?.detail || 'This time slot is no longer available. Please select another time.');
      fetchSlots(selectedDate);
    }
  };

  const resetBooking = () => {
    setBookingStatus('idle');
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setFormData({ name: '', email: '' });
  };

  const makeGCalUrl = () => {
    if (!bookingResult || !eventType) return '#';
    const start = new Date(bookingResult.start_time);
    const end = new Date(bookingResult.end_time);
    const fmt = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const text = encodeURIComponent(`Meeting with Rajendra Dhaka: ${eventType.name}`);
    return `https://calendar.google.com/calendar/r/eventedit?text=${text}&dates=${fmt(start)}/${fmt(end)}`;
  };

  // Calendar rendering logic
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const today = startOfDay(new Date());

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const dayHeaders = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    rows.push(
      <div className="calendar-grid-header" key="header">
        {dayHeaders.map(day => (
          <div className="calendar-day-header" key={day}>{day}</div>
        ))}
      </div>
    );

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const isPast = isBefore(day, today);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        
        const isDisabled = isPast || !isCurrentMonth;

        days.push(
          <div
            className={`calendar-cell ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
            key={day}
            onClick={() => {
              if (!isDisabled) setSelectedDate(cloneDay);
            }}
          >
            <span className="calendar-number">{formattedDate}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="calendar-row" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="calendar-body">{rows}</div>;
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10rem' }}>Loading...</div>;
  if (error || !eventType) return <div style={{ textAlign: 'center', marginTop: '5rem' }}><h2>{error || 'Not found'}</h2></div>;

  if (bookingStatus === 'success') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-page)' }}>
        <div className="card" style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem 2rem' }}>
          <CheckCircle size={64} color="#1E8E3E" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>You are scheduled</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>A calendar invitation has been sent to your email address.</p>
          
          <div style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{eventType.name}</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              <Clock size={16} />
              <span>{fFullDate(bookingResult.start_time)}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              <Globe size={16} />
              <span>{fTime(bookingResult.start_time)} - {fTime(bookingResult.end_time)} ({userTimezone})</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href={makeGCalUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <CalendarPlus size={18} /> Add to Google Calendar
            </a>
            <button type="button" className="btn btn-outline" onClick={resetBooking}>
              Schedule another event
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1rem', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <div className="card booking-container" style={{ width: '100%', maxWidth: selectedDate && !selectedTimeSlot ? '1050px' : '800px', display: 'flex', overflow: 'hidden', padding: 0, minHeight: '400px', transition: 'max-width 0.3s' }}>
        
        {/* Left sidebar - Event Details */}
        <div style={{ width: '320px', borderRight: '1px solid var(--border)', padding: '2rem', flexShrink: 0 }}>
          <h2 style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Rajendra Dhaka</h2>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{eventType.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 500 }}>
            <Clock size={18} />
            {eventType.duration} min
          </div>

          {(selectedDate && selectedTimeSlot) && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-secondary)', marginTop: '1.5rem', fontWeight: 500 }}>
              <Globe size={18} style={{ marginTop: '2px' }} />
              <div>
                {fFullDate(selectedDate)}
                <br />
                {fTime(selectedTimeSlot.datetime_utc)}
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Time zone</label>
            <select 
              value={userTimezone}
              onChange={(e) => setUserTimezone(e.target.value)}
              className="form-input"
              style={{ padding: '0.5rem', fontSize: '0.875rem', background: 'var(--bg-page)' }}
            >
              {uniqueTimezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right side - Dynamic Content */}
        <div style={{ flex: 1, padding: '2rem', display: 'flex' }}>
          
          {selectedTimeSlot ? (
            /* Booking Form View */
            <div style={{ flex: 1, animation: 'fadeIn 0.3s' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Enter Details</h2>
              <form onSubmit={handleBook}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={bookingStatus === 'submitting'} style={{ padding: '0.75rem 1.5rem' }}>
                    {bookingStatus === 'submitting' ? 'Scheduling...' : 'Schedule Event'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setSelectedTimeSlot(null)}>
                    Back
                  </button>
                </div>
              </form>
            </div>
            
          ) : (
            /* Calendar & Time Slots View */
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '1rem' }}>
              
              {bookingResult && (
                <div style={{ background: '#f8f9fa', padding: '1rem 1.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e0e0e0' }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>Wait, need to see your last booking?</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>You can still view the receipt for the meeting you just scheduled.</span>
                  </div>
                  <button onClick={() => setBookingStatus('success')} className="btn btn-outline" style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>
                    View receipt
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Select a Date & Time</h2>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem', gap: '2rem' }}>
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}>
                      <ChevronLeft size={20} />
                    </button>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                      {format(currentDate, "MMMM yyyy")}
                    </div>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  {renderCalendar()}
                </div>

                {selectedDate && (
                  <div style={{ width: '220px', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'center' }}>
                      {fShortDate(selectedDate)}
                    </h3>
                    
                    <div style={{ flex: 1, paddingRight: '0.5rem', marginTop: '1rem' }}>
                      <div style={{ animation: 'fadeIn 0.3s' }}>
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          setTimeError(null);
                          setValidatingTime(true);
                          
                          const hhmm = e.target.elements.customTime.value; // format: "HH:mm"
                          const dateStr = format(selectedDate, 'yyyy-MM-dd');
                          const combined = `${dateStr}T${hhmm}:00`;
                          
                          try {
                            const result = await availabilityApi.checkSlot(slug, combined);
                            if (result.available) {
                              setSelectedTimeSlot({ datetime_utc: combined });
                            } else {
                              setTimeError(result.reason || "This time is not available.");
                            }
                          } catch (err) {
                            setTimeError("Could not validate time. Please try again.");
                          } finally {
                            setValidatingTime(false);
                          }
                        }}>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Enter start time
                          </label>
                          <input 
                            name="customTime"
                            type="time" 
                            required
                            className="form-input" 
                            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginBottom: '1rem' }}
                            onChange={() => setTimeError(null)}
                          />
                          
                          {timeError && (
                            <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                              {timeError}
                            </p>
                          )}

                          <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ width: '100%', padding: '0.75rem' }}
                            disabled={validatingTime}
                          >
                            {validatingTime ? 'Checking...' : 'Continue'}
                          </button>
                          {availableSlots.length > 0 && (
                            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                              (Suggested first available: {fTime(availableSlots[0].datetime_utc)})
                            </p>
                          )}
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .calendar-grid-header { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; margin-bottom: 0.5rem; }
        .calendar-day-header { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); padding: 0.5rem 0; }
        .calendar-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; margin-bottom: 0.25rem; }
        .calendar-cell { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1rem; color: var(--primary); border-radius: 50%; cursor: pointer; transition: background 0.2s; position: relative; }
        .calendar-cell:hover:not(.disabled) { background: rgba(0, 96, 230, 0.1); }
        .calendar-cell.disabled { color: #ccc; cursor: default; }
        .calendar-cell.selected { background: var(--primary); color: white; }
        .calendar-cell.selected::after { content: ''; position: absolute; bottom: 4px; width: 4px; height: 4px; background: white; border-radius: 50%; }
        
        .slot-btn { width: 100%; border: 1px solid rgba(0, 96, 230, 0.5); background: transparent; color: var(--primary); font-weight: 600; padding: 0.75rem; border-radius: 4px; text-align: center; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
        .slot-btn:hover { border-color: var(--primary); border-width: 2px; padding: calc(0.75rem - 1px); }
        
        .slots-container::-webkit-scrollbar { width: 6px; }
        .slots-container::-webkit-scrollbar-track { background: transparent; }
        .slots-container::-webkit-scrollbar-thumb { background: #dcdcdc; border-radius: 4px; }
        
        @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
        .skeleton { 
          animation: shimmer 1.5s infinite linear; 
          background: linear-gradient(to right, #f6f7f8 4%, #edeef1 25%, #f6f7f8 36%); 
          background-size: 1000px 100%; 
          border-radius: 4px; 
          border: 1px solid rgba(0,0,0,0.05); 
        }
        .slot-skeleton { height: 48px; width: 100%; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
