import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Github, Mail, UserPlus } from 'lucide-react';
import { authApi, getApiErrorMessage } from '../api';

export default function LoginPage({ isAuthenticated, onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [providers, setProviders] = useState({ google: false, github: false });
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    authApi.providers()
      .then((result) => {
        if (mounted) setProviders(result);
      })
      .catch(() => {
        if (mounted) setProviders({ google: false, github: false });
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = mode === 'register'
        ? { name: formData.name.trim(), email: formData.email.trim(), password: formData.password }
        : { email: formData.email.trim(), password: formData.password };

      const response = mode === 'register'
        ? await authApi.register(payload)
        : await authApi.login(payload);

      onAuthenticated(response);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to continue. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '1.2rem' }}>
      <section className="section-card" style={{ width: '100%', maxWidth: '520px', padding: '1.35rem', display: 'grid', gap: '1rem' }}>
        <div>
          <div className="status-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Mail size={14} />
            Account access
          </div>
          <h1 style={{ marginTop: '0.7rem', fontFamily: 'Syne, DM Sans, sans-serif', fontSize: '1.55rem', letterSpacing: '-0.04em' }}>
            {mode === 'login' ? 'Login to Slotify' : 'Create your Slotify account'}
          </h1>
          <p className="helper-copy" style={{ marginTop: '0.35rem' }}>
            Use email/password or continue with OAuth.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
          <button type="button" className={mode === 'login' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setMode('login')}>
            Login
          </button>
          <button type="button" className={mode === 'register' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setMode('register')}>
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
          {mode === 'register' ? (
            <div>
              <label className="form-label">Name</label>
              <input
                className="form-input"
                name="name"
                value={formData.name}
                onChange={handleChange}
                minLength={2}
                required
              />
            </div>
          ) : null}

          <div>
            <label className="form-label">Email</label>
            <input
              className="form-input"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              className="form-input"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <div style={{ display: 'grid', gap: '0.55rem' }}>
          <a href={authApi.oauthUrl('google')} className="btn btn-outline" style={{ justifyContent: 'space-between' }}>
            Continue with Google
            <UserPlus size={16} />
          </a>
          <a href={authApi.oauthUrl('github')} className="btn btn-outline" style={{ justifyContent: 'space-between' }}>
            Continue with GitHub
            <Github size={16} />
          </a>
          <div className="helper-copy" style={{ fontSize: '0.78rem' }}>
            Google configured: {providers.google ? 'yes' : 'no'} | GitHub configured: {providers.github ? 'yes' : 'no'}
          </div>
        </div>
      </section>
    </main>
  );
}
