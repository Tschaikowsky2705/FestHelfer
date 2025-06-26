// public/main.js

import { fetchEvents, fetchShifts, registerHelper } from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');

// 1) Veranstaltungen laden
async function loadEvents() {
  try {
    const events = await fetchEvents();
    eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
    events.forEach(e => {
      const opt = document.createElement('option');
      opt.value       = e.id;
      opt.textContent = `${e.name} (${e.date})`;
      eventSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Fehler beim Laden der Veranstaltungen:', err);
    eventSelect.innerHTML = '<option>(Fehler beim Laden)</option>';
  }
}
loadEvents();

// 2) Wenn Event gewählt wird: Shifts holen & rendern
eventSelect.addEventListener('change', async () => {
  const eventId = +eventSelect.value;
  shiftsContainer.innerHTML = '';
  if (!eventId) return;

  try {
    const shifts = await fetchShifts(eventId);
    renderShifts(shifts);
  } catch (err) {
    console.error('Fehler beim Laden der Einsätze:', err);
    shiftsContainer.innerHTML = '<p style="color:red;">Einsätze konnten nicht geladen werden.</p>';
  }
});

// 3) Shifts rendern
function renderShifts(shifts) {
  shiftsContainer.innerHTML = shifts.map(s => {
    const free = s.max_helpers - s.taken;  // <— freie Plätze
    return `
    <div class="shift-card" data-shift-id="${s.id}">
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <p><strong>Zeit:</strong>
         ${new Date(s.start_time).toLocaleString()} – 
         ${new Date(s.end_time).toLocaleString()}
      </p>
      <p><strong>Erwartung:</strong> ${s.expectations}</p>
      <p><em>${free} von ${s.max_helpers} Plätzen frei</em></p>
      <button class="btn-signup" ${free <= 0 ? 'disabled' : ''}>
        ${free > 0 ? 'Anmelden' : 'Ausgebucht'}
      </button>

      <form class="signup-form" style="display:none; margin-top:1em;">
        <input type="hidden" name="shift_id" value="${s.id}">
        <div>
          <label>E-Mail:</label><br>
          <input type="email" name="email" required style="width:100%;">
        </div>
        <div style="margin-top:0.5em">
          <label>Name (optional):</label><br>
          <input type="text" name="name" style="width:100%;">
        </div>
        <button type="submit" style="margin-top:0.5em;">Absenden</button>
        <div class="msg" style="margin-top:0.5em;"></div>
      </form>
    </div>`;
  }).join('');

  // 4) Handler binden
  shiftsContainer.querySelectorAll('.shift-card').forEach(card => {
    const btn   = card.querySelector('.btn-signup');
    const form  = card.querySelector('.signup-form');
    const msg   = card.querySelector('.msg');
    const spots = card.querySelector('p em');

    btn.addEventListener('click', () => {
      form.style.display = 'block';
      form.scrollIntoView({ behavior: 'smooth' });
    });

    form.addEventListener('submit', async ev => {
      ev.preventDefault();
      const fd       = new FormData(form);
      const shift_id = +fd.get('shift_id');
      const email    = fd.get('email').trim();
      const name     = fd.get('name').trim() || null;

      try {
        await registerHelper({ shift_id, email, name });

        msg.style.color   = 'green';
        msg.textContent   = 'Danke! Dein Eintrag wurde gespeichert.';

        // Plätze neu laden und aktualisieren
        const updatedShifts = await fetchShifts(+eventSelect.value);
        const updated      = updatedShifts.find(x => x.id === shift_id);
        const freeUpdated  = updated.max_helpers - updated.taken;
        spots.textContent  = `${freeUpdated} von ${updated.max_helpers} Plätzen frei`;

        form.reset();
      } catch (err) {
        console.error('Fehler bei der Registrierung:', err);
        msg.style.color   = 'red';
        msg.textContent   = 'Fehler beim Speichern. Bitte später nochmal probieren.';
      }
    });
  });
}
