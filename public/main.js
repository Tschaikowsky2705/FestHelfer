import { fetchEvents, fetchShifts, registerHelper } from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');
const regContainer    = document.getElementById('registration-container');
const regShiftSelect  = document.getElementById('reg-shift');
const regForm         = document.getElementById('reg-form');
const regMsg          = document.getElementById('reg-msg');

// 1) Beim Laden: Events abrufen
async function loadEvents() {
  try {
    console.log('▶ loadEvents()');
    const events = await fetchEvents();
    eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
    events.forEach(e => {
      const opt = document.createElement('option');
      opt.value       = e.id;
      opt.textContent = `${e.name} (${e.date})`;
      eventSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('❌ Fehler loadEvents():', err);
    eventSelect.innerHTML = '<option>(Fehler beim Laden)</option>';
  }
}
loadEvents();

// 2) Wenn ein Event gewählt wird, Shifts holen und Registrierung anzeigen
eventSelect.addEventListener('change', async (e) => {
  const eventId = +e.target.value;
  clearShifts();
  clearRegistration();
  if (!eventId) return;

  try {
    const shifts = await fetchShifts(eventId);
    renderShifts(shifts);
    setupRegistration(shifts);
  } catch (err) {
    console.error('❌ Fehler beim Laden der Einsätze:', err);
  }
});

function clearShifts() {
  shiftsContainer.innerHTML = '';
}

function renderShifts(shifts) {
  shiftsContainer.innerHTML = shifts.map(s => `
    <div class="shift-card">
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <p><strong>Zeit:</strong>
         ${new Date(s.start_time).toLocaleString('de-CH')} –
         ${new Date(s.end_time).toLocaleString('de-CH')}</p>
      <p><strong>Erwartung:</strong> ${s.expectations}</p>
    </div>
  `).join('');
}

function clearRegistration() {
  regContainer.style.display   = 'none';
  regShiftSelect.innerHTML     = '<option value="">-- bitte wählen --</option>';
  regMsg.textContent           = '';
}

function setupRegistration(shifts) {
  regShiftSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
  shifts.forEach(s => {
    const opt = document.createElement('option');
    opt.value       = s.id;
    opt.textContent = `${s.title} (${new Date(s.start_time).toLocaleTimeString('de-CH')})`;
    regShiftSelect.appendChild(opt);
  });
  regContainer.style.display = 'block';
}

// 3) Registrierung absenden
regForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const shift_id = +regShiftSelect.value;
  const email    = document.getElementById('reg-email').value.trim();
  const name     = document.getElementById('reg-name').value.trim() || null;

  try {
    await registerHelper({ shift_id, email, name });
    regMsg.style.color         = 'green';
    regMsg.textContent         = 'Danke, deine Anmeldung ist eingegangen!';
    regForm.reset();
  } catch (err) {
    console.error('❌ Fehler registerHelper():', err);
    regMsg.style.color         = 'red';
    regMsg.textContent         = 'Fehler bei der Anmeldung.';
  }
});
