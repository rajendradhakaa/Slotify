import { useState, useEffect } from 'react';
import { Copy, Plus, Trash2, Edit2, Link as LinkIcon, ExternalLink, HelpCircle, Search, Settings } from 'lucide-react';
import { eventTypesApi } from '../api';

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', duration: 30, slug: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEventTypes();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await eventTypesApi.update(editingId, formData);
      } else {
        await eventTypesApi.create(formData);
      }
      setShowForm(false);
      setFormData({ name: '', duration: 30, slug: '' });
      setEditingId(null);
      fetchEventTypes();
    } catch (error) {
      alert(error.response?.data?.detail || 'Error saving event type');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event type?')) {
      try {
        await eventTypesApi.delete(id);
        fetchEventTypes();
      } catch (error) {
        console.error('Error deleting event type:', error);
      }
    }
  };

  const handleEdit = (event) => {
    setFormData({
      name: event.name,
      duration: event.duration,
      slug: event.slug,
      color: event.color
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const copyLink = (slug) => {
    const link = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };


  const generateSlug = (name) => {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    if (!base) return '';
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${base}-${suffix}`;
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    // Auto-generate slug ONLY for new events (not editing)
    const newSlug = editingId ? formData.slug : generateSlug(newName);
    setFormData({ ...formData, name: newName, slug: newSlug });
  };

  const filteredEvents = searchQuery.trim() === '' 
    ? eventTypes 
    : eventTypes.filter(event => 
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="event-types-page" style={{ animation: 'fadeIn 0.4s' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', marginTop: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Scheduling</h1>
        <HelpCircle size={18} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        {['Event types'].map(tab => (
          <button 
            key={tab}
            style={{ 
              padding: '0.75rem 0.25rem', 
              fontSize: '0.9375rem', 
              fontWeight: 600, 
              color: 'var(--primary)',
              borderBottom: '3px solid var(--primary)',
              marginBottom: '-2px',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', width: '380px' }}>
          <Search size={18} color="#737373" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search event types" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.625rem 1rem 0.625rem 2.5rem', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              fontSize: '0.9375rem' 
            }} 
          />
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', duration: 30, slug: '' });
            setShowForm(!showForm);
          }}
          style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
        >
          <Plus size={20} style={{ marginRight: '0.5rem' }} /> Create
        </button>
      </div>

      {/* Admin User Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Rajendra Dhaka</span>
        </div>
        <button 
          onClick={() => window.open('/u/rajendradhaka', '_blank')}
          style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ExternalLink size={16} /> View landing page
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem', borderTop: '4px solid var(--primary)' }}>
          <h2 style={{ marginBottom: '1.5rem', fontWeight: 500 }}>{editingId ? 'Edit Event' : 'Create New Event'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Event Name</label>
              <input type="text" className="form-input" value={formData.name} onChange={handleNameChange} required placeholder="e.g. 30 Minute Meeting" />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input type="number" className="form-input" value={formData.duration} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})} required min="5" step="5" />
              </div>
              
              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <input type="text" className="form-input" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} required placeholder="e.g. 30-min-meet" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">Save Event Type</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', border: '1px dashed var(--border)', borderRadius: '8px' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(0,107,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <LinkIcon size={24} color="var(--primary)" />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>
            {searchQuery.trim() !== '' ? 'No event types match your search' : 'No event types yet'}
          </h3>
          {searchQuery.trim() === '' && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Create your first event type to get started</p>
          )}
        </div>
      ) : (
        /* Event List Grid */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className="card" 
              style={{ 
                padding: '1.5rem 2rem', 
                display: 'flex', 
                alignItems: 'center', 
                position: 'relative', 
                overflow: 'hidden',
                transition: 'box-shadow 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
            >
              {/* Vertical Color Bar */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: '#9b51e0' }}></div>

              {/* Event Content */}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>{event.name}</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', gap: '0.5rem' }}>
                  <span>{event.duration} min</span>  •  <span>Google Meet</span>  •  <span>One-on-One</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Weekdays, 9 am - 5 pm
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  onClick={() => copyLink(event.slug)}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '40px', 
                    border: '1px solid var(--border)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f9f9f9'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Copy size={16} /> Copy link
                </button>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button onClick={() => handleEdit(event)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '4px' }}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(event.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '4px' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
