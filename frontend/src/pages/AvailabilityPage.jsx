import { useEffect, useMemo, useState } from 'react';
import { Clock, Copy, Wand2 } from 'lucide-react';
import { availabilityApi, getApiErrorMessage } from '../api';
import useMediaQuery from '../hooks/useMediaQuery';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function snapshotRules(rules) {
  return JSON.stringify(
    rules
      .map((rule) => ({
        day_of_week: rule.day_of_week,
        start_time: rule.start_time,
        end_time: rule.end_time,
        is_active: rule.is_active,
      }))
      .sort((left, right) => left.day_of_week - right.day_of_week)
  );
}

function getHoursForRange(startTime, endTime) {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  return ((endHours * 60 + endMinutes) - (startHours * 60 + startMinutes)) / 60;
}

export default function AvailabilityPage() {
  const isCompact = useMediaQuery('(max-width: 900px)');
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchAvailability();
  }, []);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setFeedback(null), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const fetchAvailability = async () => {
    try {
      const data = await availabilityApi.getAll();
      setRules(data);
      setSavedSnapshot(snapshotRules(data));
    } catch (error) {
      console.error('Error fetching availability:', error);
      setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Could not load availability settings.') });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (dayIndex) => {
    const updated = rules.map(rule => {
      if (rule.day_of_week === dayIndex) {
        return { ...rule, is_active: !rule.is_active };
      }
      return rule;
    });
    setRules(updated);
  };

  const handleTimeChange = (dayIndex, field, value) => {
    const updated = rules.map(rule => {
      if (rule.day_of_week === dayIndex) {
        return { ...rule, [field]: value };
      }
      return rule;
    });
    setRules(updated);
  };

  const applyPreset = (presetName) => {
    const presetRules = DAYS.map((_, dayIndex) => {
      const currentRule = rules.find((rule) => rule.day_of_week === dayIndex);
      let nextRule = {
        ...(currentRule ?? { day_of_week: dayIndex }),
        day_of_week: dayIndex,
      };

      if (presetName === 'weekday-core') {
        nextRule = {
          ...nextRule,
          start_time: '09:00',
          end_time: '17:00',
          is_active: dayIndex < 5,
        };
      } else if (presetName === 'extended') {
        nextRule = {
          ...nextRule,
          start_time: '10:00',
          end_time: '18:00',
          is_active: dayIndex < 5,
        };
      } else if (presetName === 'all-week') {
        nextRule = {
          ...nextRule,
          start_time: '09:00',
          end_time: '17:00',
          is_active: true,
        };
      }

      return nextRule;
    });

    setRules(presetRules);
    setFeedback({ type: 'success', message: 'Availability preset applied.' });
  };

  const copyMondayToWeekdays = () => {
    const monday = rules.find((rule) => rule.day_of_week === 0);
    if (!monday) {
      return;
    }

    setRules((currentRules) =>
      currentRules.map((rule) => (
        rule.day_of_week < 5
          ? {
              ...rule,
              start_time: monday.start_time,
              end_time: monday.end_time,
              is_active: monday.is_active,
            }
          : rule
      ))
    );
    setFeedback({ type: 'success', message: 'Monday hours copied to weekdays.' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await availabilityApi.update(rules);
      setRules(response);
      setSavedSnapshot(snapshotRules(response));
      setFeedback({ type: 'success', message: 'Availability saved successfully.' });
    } catch (error) {
      console.error('Error saving:', error);
      setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Failed to save availability.') });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = !loading && snapshotRules(rules) !== savedSnapshot;
  const activeRules = useMemo(() => rules.filter((rule) => rule.is_active), [rules]);
  const activeDays = activeRules.length;
  const totalWeeklyHours = activeRules.reduce((sum, rule) => sum + getHoursForRange(rule.start_time, rule.end_time), 0);
  const earliestStart = activeRules.length
    ? activeRules.map((rule) => rule.start_time).sort()[0]
    : 'Unavailable';

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="skeleton" style={{ height: '220px' }} />
        <div className="metrics-grid">
          {[1, 2, 3].map((item) => (
            <div key={item} className="skeleton" style={{ height: '120px' }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: '420px' }} />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {feedback ? (
        <div className={`toast-banner ${feedback.type === 'error' ? 'error' : ''}`}>
          <Clock size={16} />
          {feedback.message}
        </div>
      ) : null}

      <section className="page-hero">
        <div className="eyebrow">
          <Clock size={14} />
          Weekly hours
        </div>
        <h1 className="hero-title">Set hours that feel real on the calendar</h1>
        <p className="hero-copy">
          This is the part people notice when they open your booking page. Keep it simple and honest.
        </p>
        <div className="action-row">
          <button type="button" className="btn btn-light" onClick={handleSave} disabled={saving || !hasChanges}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button type="button" className="btn btn-light" onClick={copyMondayToWeekdays}>
            <Copy size={16} />
            Copy Monday to weekdays
          </button>
        </div>
      </section>

      <div className="metrics-grid">
        <div className="section-card metric-card">
          <span className="metric-label">Active days</span>
          <div className="metric-value">{activeDays}</div>
        </div>
        <div className="section-card metric-card">
          <span className="metric-label">Weekly hours</span>
          <div className="metric-value">{totalWeeklyHours || 0}h</div>
        </div>
        <div className="section-card metric-card">
          <span className="metric-label">Earliest opening</span>
          <div className="metric-value" style={{ fontSize: '1.35rem' }}>{earliestStart}</div>
        </div>
      </div>

      <section className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="toolbar-row">
          <div>
            <h2 style={{ fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
              Weekly availability
            </h2>
            <p className="helper-copy" style={{ marginTop: '0.35rem' }}>
              Apply a baseline, then fine-tune the days that need something more custom.
            </p>
          </div>

          {hasChanges ? <span className="status-chip warning">Unsaved changes</span> : <span className="status-chip success">Saved</span>}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => applyPreset('weekday-core')}>
            <Wand2 size={16} />
            Weekdays 9-5
          </button>
          <button type="button" className="btn btn-outline" onClick={() => applyPreset('extended')}>
            <Wand2 size={16} />
            Weekdays 10-6
          </button>
          <button type="button" className="btn btn-outline" onClick={() => applyPreset('all-week')}>
            <Wand2 size={16} />
            All week 9-5
          </button>
        </div>

        <div style={{ display: 'grid', gap: '0.9rem' }}>
          {rules.map((rule) => {
            const dayName = DAYS[rule.day_of_week];

            return (
              <article
                key={rule.day_of_week}
                className="section-card"
                style={{
                  padding: '1.1rem',
                  background: rule.is_active ? 'var(--bg-content)' : 'var(--surface-muted)',
                  borderColor: rule.is_active ? `var(--primary-ring)` : 'var(--border)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isCompact ? '1fr' : '180px minmax(0, 1fr) auto',
                    gap: '1rem',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.05rem', fontWeight: 800 }}>{dayName}</div>
                    <div className={`status-chip ${rule.is_active ? 'success' : 'muted'}`} style={{ marginTop: '0.6rem' }}>
                      {rule.is_active ? 'Available' : 'Offline'}
                    </div>
                  </div>

                  {rule.is_active ? (
                    <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : 'minmax(0, 1fr) 44px minmax(0, 1fr)', gap: '0.75rem', alignItems: 'center' }}>
                      <div>
                        <input
                          type="time"
                          className="form-input"
                          value={rule.start_time}
                          onChange={(e) => handleTimeChange(rule.day_of_week, 'start_time', e.target.value)}
                          title="Click to set custom start time (format: HH:MM)"
                          style={{ cursor: 'pointer' }}
                        />
                        <div className="helper-copy" style={{ marginTop: '0.3rem', fontSize: '0.75rem' }}>Start time</div>
                      </div>
                      <span style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 700 }}>→</span>
                      <div>
                        <input
                          type="time"
                          className="form-input"
                          value={rule.end_time}
                          onChange={(e) => handleTimeChange(rule.day_of_week, 'end_time', e.target.value)}
                          title="Click to set custom end time (format: HH:MM)"
                          style={{ cursor: 'pointer' }}
                        />
                        <div className="helper-copy" style={{ marginTop: '0.3rem', fontSize: '0.75rem' }}>End time</div>
                      </div>
                    </div>
                  ) : (

                    <div className="helper-copy">No bookable hours on this day.</div>
                  )}

                  <button
                    type="button"
                    className={`btn ${rule.is_active ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => handleToggleDay(rule.day_of_week)}
                    style={{ minWidth: isCompact ? '100%' : '132px' }}
                  >
                    {rule.is_active ? 'Turn off' : 'Turn on'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
