import { useState, useEffect } from 'react';
import { Clock, Calendar, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { bookingsApi } from '../api';

export default function MeetingsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let ignore = false;

    const loadMeetings = async () => {
      setLoading(true);
      try {
        const isUpcoming = activeTab === 'upcoming';
        const data = await bookingsApi.getAll(isUpcoming);
        data.sort((a, b) => {
          const dateA = new Date(a.start_time).getTime();
          const dateB = new Date(b.start_time).getTime();
          return isUpcoming ? dateA - dateB : dateB - dateA;
        });

        if (!ignore) {
          setMeetings(data);
        }
      } catch (error) {
        console.error('Error fetching meetings:', error);
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

  const handleCancel = async (id) => {
    if (window.confirm('Are you confirm to cancel this scheduled meeting?')) {
      try {
        await bookingsApi.cancel(id);
        setMeetings((currentMeetings) =>
          currentMeetings.map((meeting) =>
            meeting.id === id ? { ...meeting, status: 'cancelled' } : meeting
          )
        );
      } catch (error) {
        alert('Could not cancel meeting');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'scheduled':
        return <span style={{ background: '#E6F4EA', color: '#1E8E3E', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Scheduled</span>;
      case 'cancelled':
        return <span style={{ background: '#FCE8E6', color: '#D93025', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Canceled</span>;
      default:
        return <span style={{ background: '#F1F3F4', color: '#5F6368', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{status}</span>;
    }
  };

  return (
    <div className="meetings-page" style={{ animation: 'fadeIn 0.4s' }}>
      <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem', marginTop: '1rem' }}>Scheduled Events</h1>

      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('upcoming')}
          style={{ 
            background: 'none', 
            border: 'none', 
            padding: '0.75rem 0.25rem', 
            fontSize: '0.9375rem',
            color: activeTab === 'upcoming' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            borderBottom: activeTab === 'upcoming' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s'
          }}
        >
          Upcoming
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          style={{ 
            background: 'none', 
            border: 'none', 
            padding: '0.75rem 0.25rem', 
            fontSize: '0.9375rem',
            color: activeTab === 'past' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            borderBottom: activeTab === 'past' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s'
          }}
        >
          Past
        </button>
      </div>

      <div className="meetings-list">
        {loading ? (
          <p>Loading meetings...</p>
        ) : meetings.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', border: '1px dashed var(--border)', borderRadius: '8px' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(0,0,0,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Calendar size={24} color="var(--text-secondary)" />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>No Events Scheduled</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You have no {activeTab} events at the moment.</p>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div key={meeting.id} className="card" style={{ marginBottom: '1rem', display: 'flex' }}>
              {/* Date Box */}
              <div style={{ 
                padding: '1.5rem', 
                borderRight: '1px solid var(--border)', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                minWidth: '120px',
                background: 'rgba(0,0,0,0.02)'
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  {format(new Date(meeting.start_time), "MMM")}
                </span>
                <span style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {format(new Date(meeting.start_time), "d")}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {format(new Date(meeting.start_time), "EEEE")}
                </span>
              </div>
              
              {/* Event Details */}
              <div style={{ padding: '1.5rem', flex: 1, position: 'relative' }}>
                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                  {getStatusBadge(meeting.status)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  <Clock size={16} /> 
                  {format(new Date(meeting.start_time), "h:mm a")} - {format(new Date(meeting.end_time), "h:mm a")}
                </div>
                
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>{meeting.invitee_name}</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr)', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <div>
                    <strong>Event Type</strong><br/>
                    {meeting.event_type_name || `ID: ${meeting.event_type_id}`}
                  </div>
                  <div>
                    <strong>Email</strong><br/>
                    <a href={`mailto:${meeting.invitee_email}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{meeting.invitee_email}</a>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <strong>Created</strong><br/>
                    {format(new Date(meeting.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>

                {activeTab === 'upcoming' && meeting.status === 'scheduled' && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-start' }}>
                    <button 
                      onClick={() => handleCancel(meeting.id)}
                      className="btn-text"
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0 }}
                    >
                      <XCircle size={16} /> Cancel event
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
