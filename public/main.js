// public/main.js

import { fetchEvents, fetchShifts, registerHelper } from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');
const regContainer    = document.getElementById('registration-container');
const regShiftSelect  = document.getElementById('reg-shift');
const regForm         = document.getElementById('reg-form');
const regEmailInput   = document.getElementById('reg-email');
const regNameInput    = document.getElementById('reg-name');
const regMsg          = document.getElementById('reg-msg');

// 1) Events laden
async function loadEvents() {
  try {
    console.log('▶️ loadEvents() startet');
    const events = await fetchEvents();
    console.log('✅ Events erhalten:', events);
    eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
    events.forEach(e => {
      const opt = document.createElement('option');
      opt.value       = e.id;
      opt.textContent = `${e.name} (${e.date})`;
      eventSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('❌ Fehler in loadEvents():', err);
    eventSelect.innerHTML = '<option value="">(Fehler beim Laden)</option>';
  }
}
loadEvents();

// 2) Wenn Event gewählt → Shifts & Registrierung
eventSelect.addEventListener('change', async e => {
  const eventId = +e.target.value;
  shiftsContainer.innerHTML = '';
  regContainer.style.display = 'none';
  regMsg.textContent = '';

  if (!eventId) return;

  const shifts = await fetchShifts(eventId);
  // a) Shifts rendern
  shiftsContainer.innerHTML = shifts.map(s => `
    <div class="shift-card" data-shift-id="${s.id}">
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <p><strong>Zeit:</strong> 
         ${new Date(s.start_time).toLocaleString()} – 
         ${new Date(s.end_time).toLocaleString()}
      </p>
      <p>${s.taken} von ${s.max_helpers} Plätzen belegt</p>
      <button class="btn-choose" ${s.taken >= s.max_helpers ? 'disabled' : ''}>
        ${s.taken >= s.max_helpers ? 'Ausgebucht' : 'Anmelden'}
      </button>
    </div>
  `).join('');

  // b) Registrierung vorbereiten
  regContainer.style.display = 'block';
  regShiftSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
  shifts.forEach(s => {
    const opt = document.createElement('option');
    opt.value       = s.id;
    opt.textContent = `${s.title} (${new Date(s.start_time).toLocaleTimeString()})`;
    opt.disabled    = s.taken >= s.max_helpers;
    regShiftSelect.appendChild(opt);
  });
});

// 3) Registrierungs-Form abschicken
regForm.addEventListener('submit', async e => {
  e.preventDefault();
  const shift_id = +regShiftSelect.value;
  const email    = regEmailInput.value.trim();
  const name     = regNameInput.value.trim() || null;

  try {
    await registerHelper({ shift_id, email, name });
    regMsg.style.color = 'green';
    regMsg.textContent = 'Danke, deine Anmeldung ist eingegangen!';
    regForm.reset();
    eventSelect.dispatchEvent(new Event('change'));  // neu laden
  } catch (err) {
    console.error(err);
    if (err.message === 'Mailversand fehlgeschlagen') {
      regMsg.style.color = 'orange';
      regMsg.textContent = 'Anmeldung gespeichert, E-Mail konnte nicht gesendet werden.';
    } else {
      regMsg.style.color = 'red';
      regMsg.textContent = 'Fehler bei der Anmeldung.';
    }
  }
});
