'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const form = e.target;
    const data = {
      name: form.name.value,
      email: form.email.value,
      company: form.company.value,
      phone: form.phone.value,
      description: form.description.value,
      services: []
    };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Erreur');
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Nom *</label>
          <input id="name" name="name" required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input id="email" name="email" type="email" required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="company">Entreprise</label>
          <input id="company" name="company" />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Téléphone</label>
          <input id="phone" name="phone" />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="description">Description du projet *</label>
        <textarea id="description" name="description" rows={5} required />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Envoi…' : 'Envoyer'}
      </button>
      {status === 'success' && <p className="form-success">Message envoyé avec succès.</p>}
      {status === 'error' && <p className="form-error">Erreur lors de l&apos;envoi. Réessayez.</p>}
    </form>
  );
}
