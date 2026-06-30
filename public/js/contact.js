(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  if (!form) return;

  const messageEl = document.getElementById('form-message');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const services = Array.from(form.querySelectorAll('input[name="services"]:checked')).map(c => c.value);
    const data = {
      name: form.name.value.trim(),
      company: form.company.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      description: form.description.value.trim(),
      services
    };

    if (!data.name || !data.email || !data.description) {
      showMessage('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        showMessage(result.message || 'Demande envoyée avec succès !', 'success');
        form.reset();
      } else {
        showMessage(result.error || 'Une erreur est survenue.', 'error');
      }
    } catch {
      showMessage('Erreur de connexion. Réessayez plus tard.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer la demande';
    }
  });

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'form-message ' + type;
    messageEl.hidden = false;
  }
})();
