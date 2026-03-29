import { useEffect, useState } from 'react';
import {
  Clock,
  Copy,
  Edit2,
  ExternalLink,
  Eye,
  Link as LinkIcon,
  Palette,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { eventTypesApi, getApiErrorMessage } from '../api';
import useMediaQuery from '../hooks/useMediaQuery';

const DEFAULT_EVENT_FORM = {
  name: '',
  duration: 30,
  slug: '',
  color: '#1457FF',
  is_active: true,
};

const COLOR_OPTIONS = ['#1457FF', '#0F9D58', '#FF8A3D', '#6C4CFF', '#D9467A'];

const EVENT_TEMPLATES = [
  { name: 'Quick intro', duration: 15 },
  { name: 'Discovery call', duration: 30 },
  { name: 'Project deep dive', duration: 45 },
  { name: 'Weekly review', duration: 60 },
];

export default function EventTypesPage() {
  const isCompact = useMediaQuery('(max-width: 900px)');
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_EVENT_FORM);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchEventTypes();
  }, []);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setFeedback(null), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const fetchEventTypes = async () => {
    try {
      const data = await eventTypesApi.getAll();
      setEventTypes(data);
    } catch (error) {
      console.error('Error fetching event types:', error);
      setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Could not load event types.') });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ ...DEFAULT_EVENT_FORM });
    setEditingId(null);
    setShowForm(false);
  };

  const generateSlug = (name) => {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!base) {
      return '';
    }

    const suffix = Math.random().toString(36).slice(2, 6);
    return `${base}-${suffix}`;
  };

  const publicProfileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/u/rajendradhaka`
    : '/u/rajendradhaka';

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      if (editingId) {
        await eventTypesApi.update(editingId, formData);
        setFeedback({ type: 'success', message: 'Event type updated.' });
      } else {
        await eventTypesApi.create(formData);
        setFeedback({ type: 'success', message: 'Event type created and ready to share.' });
      }
      resetForm();
      await fetchEventTypes();
    } catch (error) {
      setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Error saving event type') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event type?')) {
      try {
        await eventTypesApi.delete(id);
        setFeedback({ type: 'success', message: 'Event type deleted.' });
        await fetchEventTypes();
      } catch (error) {
        console.error('Error deleting event type:', error);
        setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Could not delete event type.') });
      }
    }
  };

  const handleEdit = (event) => {
    setFormData({
      name: event.name,
      duration: event.duration,
      slug: event.slug,
      color: event.color,
      is_active: event.is_active,
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const copyLink = async (slug) => {
    const link = `${window.location.origin}/book/${slug}`;
    await navigator.clipboard.writeText(link);
    setFeedback({ type: 'success', message: 'Booking link copied to clipboard.' });
  };

  const copyProfileLink = async () => {
    await navigator.clipboard.writeText(publicProfileUrl);
    setFeedback({ type: 'success', message: 'Public profile link copied.' });
  };

  const handleToggleActive = async (event) => {
    try {
      await eventTypesApi.update(event.id, { is_active: !event.is_active });
      setFeedback({
        type: 'success',
        message: event.is_active ? 'Event type hidden from the public page.' : 'Event type is live again.',
      });
      await fetchEventTypes();
    } catch (error) {
      setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Could not update event visibility.') });
    }
  };

  const openCreateForm = (template) => {
    if (template) {
      setFormData({
        ...DEFAULT_EVENT_FORM,
        name: template.name,
        duration: template.duration,
        slug: generateSlug(template.name),
      });
    } else {
      setFormData({ ...DEFAULT_EVENT_FORM });
    }
    setEditingId(null);
    setShowForm(true);
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    const newSlug = editingId ? formData.slug : generateSlug(newName);
    setFormData((current) => ({ ...current, name: newName, slug: newSlug }));
  };

  const searchValue = searchQuery.trim().toLowerCase();
  const filteredEvents = eventTypes
    .filter((event) => {
      if (!searchValue) {
        return true;
      }

      return (
        event.name.toLowerCase().includes(searchValue) ||
        event.slug.toLowerCase().includes(searchValue)
      );
    })
    .sort((left, right) => Number(right.is_active) - Number(left.is_active) || left.name.localeCompare(right.name));

  const activeCount = eventTypes.filter((event) => event.is_active).length;
  const totalDuration = eventTypes.reduce((sum, event) => sum + event.duration, 0);
  const averageDuration = eventTypes.length ? Math.round(totalDuration / eventTypes.length) : 0;

  const renderEventList = () => {
    if (loading) {
      return (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[1, 2, 3].map((item) => (
            <div key={item} className="skeleton" style={{ height: '150px' }} />
          ))}
        </div>
      );
    }

    if (filteredEvents.length === 0) {
      return (
        <div className="section-card empty-state">
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '20px',
              margin: '0 auto 1rem',
              background: 'var(--surface-tint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LinkIcon size={28} color="var(--primary)" />
          </div>
          <h3 style={{ fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            {searchValue ? 'Nothing matches that search yet' : 'Create your first event type'}
          </h3>
          <p className="helper-copy" style={{ maxWidth: '460px', margin: '0.75rem auto 0' }}>
            {searchValue
              ? 'Try a different keyword or clear the filter to see all booking options.'
              : 'Start with one clear session type, then expand only if people actually need more.'}
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredEvents.map((event) => (
          <article
            key={event.id}
            className="section-card"
            style={{
              padding: isCompact ? '1.2rem' : '1.35rem',
              borderColor: event.is_active ? `${event.color}2e` : 'var(--border)',
              background: event.is_active ? 'var(--bg-content)' : 'var(--surface-muted)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isCompact ? '1fr' : 'minmax(0, 1fr) auto',
                gap: '1rem',
                alignItems: 'center',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: event.color, boxShadow: `0 0 0 6px ${event.color}18` }} />
                  <span className={`status-chip ${event.is_active ? 'success' : 'muted'}`}>
                    {event.is_active ? 'Visible on public page' : 'Hidden from public page'}
                  </span>
                  <span className="status-chip muted">/{event.slug}</span>
                </div>

                <h3
                  style={{
                    marginTop: '1rem',
                    fontFamily: 'Syne, DM Sans, sans-serif',
                    fontSize: isCompact ? '1.25rem' : '1.35rem',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {event.name}
                </h3>

                <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', marginTop: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Clock size={15} />
                    {event.duration} minutes
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Palette size={15} />
                    Custom color
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                    <LinkIcon size={15} />
                    slotify-iota.vercel.app/book/{event.slug}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', justifyContent: isCompact ? 'flex-start' : 'flex-end' }}>
                <button className="btn btn-outline" type="button" onClick={() => copyLink(event.slug)} style={{ minHeight: '42px', gap: '0.45rem' }}>
                  <Copy size={16} />
                  Copy link
                </button>
                <a
                  className="btn btn-outline"
                  href={`/book/${event.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ minHeight: '42px', gap: '0.45rem' }}
                >
                  <Eye size={16} />
                  Preview
                </a>
                <button className="btn btn-outline" type="button" onClick={() => handleEdit(event)} style={{ minHeight: '42px', gap: '0.45rem' }}>
                  <Edit2 size={16} />
                  Edit
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.65rem',
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border)',
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => handleToggleActive(event)}
                style={{ minHeight: '40px', paddingInline: 0, color: event.is_active ? 'var(--accent)' : 'var(--success)', fontWeight: 700 }}
              >
                {event.is_active ? 'Pause public bookings' : 'Activate public bookings'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => handleDelete(event.id)}
                style={{ minHeight: '40px', paddingInline: 0, color: 'var(--danger)', fontWeight: 700, gap: '0.45rem' }}
              >
                <Trash2 size={16} />
                Delete event type
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      {feedback ? (
        <div className={`toast-banner ${feedback.type === 'error' ? 'error' : ''}`}>
          <LinkIcon size={16} />
          {feedback.message}
        </div>
      ) : null}

      <section className="page-hero">
        <div className="eyebrow">
          <LinkIcon size={14} />
          Scheduling links
        </div>
        <h1 className="hero-title">Build a booking menu that feels deliberate</h1>
        <p className="hero-copy">
          A good scheduling page stays small and clear. Name each session well, then make it easy to share.
        </p>
        <div className="action-row">
          <button type="button" className="btn btn-light" onClick={() => openCreateForm()}>
            <Plus size={18} />
            Create event type
          </button>
          <a href={publicProfileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-light">
            <ExternalLink size={18} />
            View public page
          </a>
        </div>
      </section>

      <div className="metrics-grid">
        <div className="section-card metric-card">
          <span className="metric-label">Total event types</span>
          <div className="metric-value">{eventTypes.length}</div>
        </div>
        <div className="section-card metric-card">
          <span className="metric-label">Live for booking</span>
          <div className="metric-value">{activeCount}</div>
        </div>
        <div className="section-card metric-card">
          <span className="metric-label">Average duration</span>
          <div className="metric-value">{averageDuration || 0} min</div>
        </div>
        <div className="section-card metric-card">
          <span className="metric-label">Public profile</span>
          <div className="metric-value">{activeCount > 0 ? 'Ready' : 'Draft'}</div>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid--sidebar">
        <section className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="toolbar-row">
            <div>
              <h2 style={{ fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                Current event types
              </h2>
              <p className="helper-copy" style={{ marginTop: '0.35rem' }}>
                Search, adjust, preview, or hide each link without leaving the page.
              </p>
            </div>

            <button type="button" className="btn btn-primary" onClick={() => openCreateForm()} style={{ gap: '0.5rem' }}>
              <Plus size={18} />
              New event
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event name or slug"
              style={{ paddingLeft: '2.8rem' }}
            />
          </div>

          {renderEventList()}
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <section className="section-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <span className="status-chip warning">{editingId ? 'Editing' : 'Builder'}</span>
                <h2 style={{ marginTop: '0.9rem', fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                  {showForm ? (editingId ? 'Edit event type' : 'Create event type') : 'Start from a useful shape'}
                </h2>
              </div>
              {showForm ? (
                <button type="button" className="btn btn-ghost" onClick={resetForm} style={{ minHeight: '40px', color: 'var(--text-secondary)' }}>
                  Close
                </button>
              ) : null}
            </div>

            {showForm ? (
              <form onSubmit={handleSubmit} style={{ marginTop: '1.2rem' }}>
                <div className="form-group">
                  <label className="form-label">Event name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Strategy session"
                    required
                  />
                  <p className="field-hint">Use a name that explains why someone would book it.</p>
                </div>

                <div className="input-grid">
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.duration}
                      onChange={(e) => setFormData((current) => ({ ...current, duration: Number.parseInt(e.target.value, 10) || 5 }))}
                      min="5"
                      step="5"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">URL slug</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.slug}
                      onChange={(e) => setFormData((current) => ({
                        ...current,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'),
                      }))}
                      placeholder="strategy-session"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Quick duration presets</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                    {[15, 30, 45, 60].map((duration) => (
                      <button
                        key={duration}
                        type="button"
                        className={`btn ${formData.duration === duration ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFormData((current) => ({ ...current, duration }))}
                        style={{ minHeight: '38px', padding: '0.45rem 0.9rem' }}
                      >
                        {duration} min
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Accent color</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData((current) => ({ ...current, color }))}
                        aria-label={`Choose color ${color}`}
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '14px',
                          background: color,
                          border: formData.color === color ? '3px solid rgba(23, 32, 51, 0.9)' : '3px solid transparent',
                          boxShadow: formData.color === color ? `0 0 0 5px ${color}22` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: '20px',
                    background: 'var(--surface-muted)',
                    border: '1px solid rgba(22, 37, 79, 0.08)',
                    marginBottom: '1.15rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>Public visibility</div>
                    <p className="field-hint" style={{ marginTop: '0.2rem' }}>
                      {formData.is_active ? 'This event type shows on the public page.' : 'Keep it hidden until it is ready.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`btn ${formData.is_active ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFormData((current) => ({ ...current, is_active: !current.is_active }))}
                    style={{ minHeight: '40px' }}
                  >
                    {formData.is_active ? 'Visible' : 'Hidden'}
                  </button>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '22px',
                    background: 'rgba(20, 87, 255, 0.04)',
                    border: `1px solid ${formData.color}28`,
                    marginBottom: '1.2rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: formData.color }} />
                    <strong>Preview</strong>
                  </div>
                  <div style={{ marginTop: '0.8rem', fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    {formData.name || 'Your event type name'}
                  </div>
                  <p className="helper-copy" style={{ marginTop: '0.35rem' }}>
                    {formData.duration} minutes · slotify-iota.vercel.app/book/{formData.slug || 'your-event'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexDirection: isCompact ? 'column' : 'row' }}>
                  <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
                    {submitting ? 'Saving...' : editingId ? 'Save changes' : 'Create event type'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={resetForm} style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {EVENT_TEMPLATES.map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    className="section-card"
                    onClick={() => openCreateForm(template)}
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.78)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800 }}>{template.name}</div>
                      <div className="helper-copy" style={{ marginTop: '0.2rem' }}>{template.duration} minute session</div>
                    </div>
                    <ExternalLink size={16} color="var(--text-secondary)" />
                  </button>
                ))}

                <button type="button" className="btn btn-primary" onClick={() => openCreateForm()} style={{ marginTop: '0.25rem' }}>
                  <Plus size={18} />
                  Start from blank
                </button>
              </div>
            )}
          </section>

          <section className="section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
              <div>
                <span className="status-chip success">Public profile</span>
                <h2 style={{ marginTop: '1rem', fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                  One page to share
                </h2>
                <p className="helper-copy" style={{ marginTop: '0.45rem' }}>
                  Keep the public page focused. People should only see the sessions that are ready to book.
                </p>
              </div>
              <a href={publicProfileUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                <ExternalLink size={18} />
              </a>
            </div>

            <div style={{ marginTop: '1.15rem', padding: '1rem', borderRadius: '20px', background: 'var(--surface-muted)', border: '1px solid rgba(22, 37, 79, 0.08)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Public URL
              </div>
              <div style={{ marginTop: '0.45rem', fontSize: '0.95rem', fontWeight: 700, wordBreak: 'break-all' }}>{publicProfileUrl}</div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
              <button type="button" className="btn btn-outline" onClick={copyProfileLink} style={{ flex: 1, gap: '0.45rem' }}>
                <Copy size={16} />
                Copy public link
              </button>
              <a href={publicProfileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ flex: 1, gap: '0.45rem' }}>
                <Eye size={16} />
                Preview page
              </a>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <div className="stat-line">
                <span>Live event types</span>
                <strong>{activeCount}</strong>
              </div>
              <div className="stat-line">
                <span>Draft or hidden</span>
                <strong>{eventTypes.length - activeCount}</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
