'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { siteConfig } from '@/lib/config';

export default function AdminLoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.target;
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.username.value,
        password: form.password.value
      })
    });
    if (!res.ok) {
      setError('Identifiants incorrects.');
      setLoading(false);
      return;
    }
    router.push(`/${siteConfig.adminPath}`);
    router.refresh();
  }

  return (
    <div className="admin-login-card">
      <div className="admin-login-header">
        <img src="/assets/img/logo.png" alt="Aroman EMETSHU" className="admin-login-logo" />
        <h1>Aroman EMETSHU</h1>
        <p>Espace d&apos;administration</p>
      </div>
      <form className="admin-login-form" onSubmit={onSubmit}>
        {error && <p className="admin-error">{error}</p>}
        <div className="form-group">
          <label htmlFor="username">Identifiant</label>
          <input id="username" name="username" required autoComplete="username" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
