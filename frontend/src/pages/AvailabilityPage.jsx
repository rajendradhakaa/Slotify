import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { availabilityApi } from '../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AvailabilityPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const data = await availabilityApi.getAll();
      setRules(data);
    } catch (error) {
      console.error('Error fetching availability:', error);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await availabilityApi.update(rules);
      alert('Availability saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="availability-page" style={{ animation: 'fadeIn 0.4s' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', marginTop: '1rem' }}>
        <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Availability Settings</h1>
        <button 
          className="btn btn-primary" 
          onClick={handleSave}
          disabled={saving}
          style={{ paddingLeft: '2rem', paddingRight: '2rem' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clock color="var(--primary)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Weekly Hours</h2>
        </div>

        <div className="rules-list">
          {rules.map((rule) => {
            const dayName = DAYS[rule.day_of_week];
            return (
              <div 
                key={rule.day_of_week}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '1.5rem', 
                  borderBottom: '1px solid var(--border)',
                  background: rule.is_active ? 'transparent' : 'rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ width: '160px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input 
                    type="checkbox" 
                    checked={rule.is_active}
                    onChange={() => handleToggleDay(rule.day_of_week)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontWeight: 600, color: rule.is_active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {dayName}
                  </span>
                </div>

                {rule.is_active ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      type="time" 
                      className="form-input" 
                      style={{ width: 'auto', padding: '0.5rem' }}
                      value={rule.start_time}
                      onChange={(e) => handleTimeChange(rule.day_of_week, 'start_time', e.target.value)}
                    />
                    <span>-</span>
                    <input 
                      type="time" 
                      className="form-input" 
                      style={{ width: 'auto', padding: '0.5rem' }}
                      value={rule.end_time}
                      onChange={(e) => handleTimeChange(rule.day_of_week, 'end_time', e.target.value)}
                    />
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Unavailable
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
