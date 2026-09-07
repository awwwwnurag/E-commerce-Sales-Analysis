'use client';

import { Suspense, useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/dashboard';

  // Redirect if already signed in
  useEffect(() => {
    if (status === 'authenticated') router.replace(redirect);
  }, [status, router, redirect]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signIn('google', { callbackUrl: redirect });
    } catch {
      setError('Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      // Create account via API
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, companyName }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Signup failed.');
          setLoading(false);
          return;
        }
        // Auto sign-in after signup
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
        if (result?.error) {
          setError('Account created! Please sign in.');
          setMode('login');
        } else {
          router.replace(redirect);
        }
      } catch {
        setError('Something went wrong. Please try again.');
      }
    } else {
      // Login with credentials
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('Invalid email or password.');
      } else {
        router.replace(redirect);
      }
    }
    setLoading(false);
  };

  if (status === 'loading') {
    return (
      <div className="auth-root">
        <div className="auth-spinner" />
      </div>
    );
  }

  return (
    <div className="auth-root">
      <div className="auth-bg-glow auth-bg-glow-1" />
      <div className="auth-bg-glow auth-bg-glow-2" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">📊</div>
          <span className="auth-logo-text">SalesIQ</span>
        </div>

        <h1 className="auth-title">
          {mode === 'login' ? 'Welcome back' : 'Create your workspace'}
        </h1>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Sign in to access your sales dashboard.'
            : 'Start your free workspace — no credit card required.'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        {/* Google Sign-In */}
        <button
          className="google-btn"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <span className="btn-spinner" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.8 20-21 0-1.4-.2-2.7-.5-4z" fill="#FFC107"/>
              <path d="M6.3 14.7l7 5.1C15.1 16.4 19.2 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 16.3 3 9.6 7.9 6.3 14.7z" fill="#FF3D00"/>
              <path d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.5C29.6 36.1 27 37 24 37c-6 0-11.1-4-12.9-9.5L4 33c3.3 7 10.3 12 20 12z" fill="#4CAF50"/>
              <path d="M44.5 20H24v8.5h11.8c-.8 2.5-2.5 4.5-4.8 5.9l6.6 5.5C42 36.3 45 30.6 45 24c0-1.4-.2-2.7-.5-4z" fill="#1976D2"/>
            </svg>
          )}
          {googleLoading ? 'Connecting…' : 'Continue with Google'}
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="form-field">
              <label className="form-label">Company / Workspace Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={mode === 'signup' ? 8 : 1}
              required
            />
          </div>

          <button className="submit-btn" type="submit" disabled={loading || googleLoading}>
            {loading ? (
              <><span className="btn-spinner" /> {mode === 'login' ? 'Signing in…' : 'Creating workspace…'}</>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Workspace'
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="auth-toggle">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            className="auth-toggle-btn"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
          >
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>

        {mode === 'login' && (
          <p className="pricing-link-hint">
            Looking for pricing?{' '}
            <a href="/pricing">View our plans →</a>
          </p>
        )}
      </div>

      <style jsx>{`
        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0d0d1a;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          padding: 1rem;
        }
        .auth-bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }
        .auth-bg-glow-1 {
          width: 500px; height: 500px;
          background: rgba(99,102,241,0.25);
          top: -200px; left: -200px;
        }
        .auth-bg-glow-2 {
          width: 400px; height: 400px;
          background: rgba(192,132,252,0.15);
          bottom: -150px; right: -150px;
        }
        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 25px 80px rgba(0,0,0,0.5);
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1.5rem;
        }
        .auth-logo-icon { font-size: 1.75rem; }
        .auth-logo-text {
          font-size: 1.4rem;
          font-weight: 800;
          background: linear-gradient(135deg, #818cf8, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .auth-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 0.4rem;
        }
        .auth-subtitle {
          color: #64748b;
          font-size: 0.9rem;
          margin: 0 0 1.5rem;
        }
        .auth-error {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.35);
          color: #fca5a5;
          border-radius: 10px;
          padding: 0.7rem 1rem;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 0.8rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .google-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.25);
        }
        .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.25rem 0;
          color: #334155;
          font-size: 0.8rem;
        }
        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .auth-divider span { color: #475569; }
        .auth-form { display: flex; flex-direction: column; gap: 1rem; }
        .form-field { display: flex; flex-direction: column; gap: 0.35rem; }
        .form-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .form-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: #f1f5f9;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input::placeholder { color: #475569; }
        .form-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        .submit-btn {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
          box-shadow: 0 4px 15px rgba(99,102,241,0.35);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(99,102,241,0.5);
        }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          display: inline-block;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-toggle {
          text-align: center;
          color: #64748b;
          font-size: 0.875rem;
          margin-top: 1.25rem;
        }
        .auth-toggle-btn {
          background: none;
          border: none;
          color: #818cf8;
          font-size: 0.875rem;
          cursor: pointer;
          font-weight: 600;
        }
        .auth-toggle-btn:hover { color: #a5b4fc; text-decoration: underline; }
        .pricing-link-hint {
          text-align: center;
          font-size: 0.8rem;
          color: #475569;
          margin-top: 0.75rem;
        }
        .pricing-link-hint a { color: #818cf8; text-decoration: none; }
        .auth-spinner {
          width: 40px; height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d1a' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
