import { ArrowRight, Github, Home, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../api';

function buildOAuthUrl(provider) {
  return `${API_BASE_URL}/auth/${provider}`;
}

export default function HomePage() {
  return (
    <section className="section-card" style={{ marginTop: '1rem', padding: '1.35rem', display: 'grid', gap: '1rem' }}>
      <div>
        <div className="status-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
          <Home size={14} />
          Home
        </div>
        <h2 style={{ marginTop: '0.75rem', fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.55rem', letterSpacing: '-0.04em' }}>
          Home now routes correctly
        </h2>
        <p className="helper-copy" style={{ marginTop: '0.45rem', maxWidth: '760px' }}>
          Clicking the Slotify brand always brings you back here. From this page, you can continue setup or start OAuth sign-in.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.9rem' }}>
        <div className="card" style={{ padding: '1rem', display: 'grid', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <ShieldCheck size={16} />
            OAuth sign-in
          </div>
          <p className="helper-copy">Use your provider and return to Slotify after authentication.</p>
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            <a href={buildOAuthUrl('google')} className="btn btn-primary" style={{ justifyContent: 'space-between' }}>
              Continue with Google
              <ArrowRight size={16} />
            </a>
            <a href={buildOAuthUrl('github')} className="btn btn-outline" style={{ justifyContent: 'space-between' }}>
              Continue with GitHub
              <Github size={16} />
            </a>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', display: 'grid', gap: '0.65rem' }}>
          <div style={{ fontWeight: 700 }}>Continue setup</div>
          <p className="helper-copy">Finish the steps required to make your scheduling page share-ready.</p>
          <div style={{ display: 'grid', gap: '0.55rem' }}>
            <Link to="/event-types" className="btn btn-outline">Go to Event Types</Link>
            <Link to="/availability" className="btn btn-outline">Go to Availability</Link>
            <Link to="/meetings" className="btn btn-outline">Go to Meetings</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
