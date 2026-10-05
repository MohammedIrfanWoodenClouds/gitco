'use client';
import { useState } from 'react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const r = await fetch('/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const d = await r.json();
    if (!r.ok) { setError(d.error || 'Login failed'); setBusy(false); return; }
    location.href = d.redirect;
  }

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={submit} autoComplete="on">
        <div className="login-logo">GITCO</div>
        <div className="login-sub">Management Reporting Portal</div>

        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            required
            placeholder="Enter your username"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            placeholder="••••••••"
          />
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button
          id="login-submit"
          className="btn btn-gold w-full mt-6"
          type="submit"
          disabled={busy}
          style={{ justifyContent: 'center', padding: '13px' }}
        >
          {busy ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>
    </div>
  );
}
