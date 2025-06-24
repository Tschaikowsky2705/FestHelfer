import { fetchEvents, fetchShifts, registerHelper } from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');
const shiftsMessage   = document.getElementById('shifts-message');
const regContainer    = document.getElementById('registration-container');
const regShiftSelect  = document.getElementById('reg-shift');
const regForm         = document.getElementById('reg-form');
const regMsg          = document.getElementById('reg-msg');

eventSelect.addEventListener('change', async e => {
  const eventId = e.target.value;
  await renderShifts(eventId);

  // Registrierung auf Event-Wechsel zurücksetzen
  regContainer.style.display = 'none';
  regShiftSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
  regMsg.textContent = '';
});

// Wenn ein Shift ausgewählt wurde, Formular anzeigen & Shift-Dropdown befüllen
async function setupRegistration(eventId) {
  const shifts = await fetchShifts(eventId);
  regShiftSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
  shifts.forEach(s => {
    const opt = document.createElement('option');
    opt.value       = s.id;
    opt.textContent = `${s.title} (${new Date(s.start_time).toLocaleTimeString()})`;
    regShiftSelect.appendChild(opt);
  });
  regContainer.style.display = 'block';
}

// Nach dem Rendern der Shifts aufrufen
async function renderShifts(eventId) {
  if (!eventId) {
    shiftsContainer.innerHTML = '';
    shiftsMessage.textContent = 'Bitte wählen…';
    return;
  }
  // … hier deine bestehende Logik, die die Karten rendert …
  shiftsMessage.textContent = '';
  // Jetzt auch das Registrierungs-Setup anstoßen:
  await setupRegistration(eventId);
}

// Registrierungs-Formular abfangen
regForm.addEventListener('submit', async e => {
  e.preventDefault();
  const shift_id = +regShiftSelect.value;
  const email    = document.getElementById('reg-email').value.trim();
  const name     = document.getElementById('reg-name').value.trim() || null;
  try {
    await registerHelper({ shift_id, email, name });
    regMsg.style.color = 'green';
    regMsg.textContent = 'Danke, deine Anmeldung ist eingegangen!';
    regForm.reset();
  } catch (err) {
    console.error(err);
    regMsg.style.color = 'red';
    regMsg.textContent = 'Fehler bei der Anmeldung.';
  }
});
