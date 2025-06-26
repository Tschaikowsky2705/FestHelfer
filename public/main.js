import { fetchEvents, fetchShifts, registerHelper } from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');
const regContainer    = document.getElementById('registration-container');
const regForm         = document.getElementById('reg-form');
const regShiftIdField = document.getElementById('reg-shift-id');
const regMsg          = document.getElementById('reg-msg');

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

// 2) Wenn Event gewählt wird, Shifts laden
eventSelect.addEventListener('change', async () => {
  const eventId = +eventSelect.value;
  shiftsContainer.innerHTML = '';
  hideRegistration();
  if (!eventId) return;

  try {
    const shifts = await fetchShifts(eventId);
    renderShifts(shifts);
  } catch (err) {
    console.error('Fehler beim Laden der Einsätze:', err);
    shiftsContainer.innerHTML = '<p style="color:red;">Einsätze konnten nicht geladen werden.</p>';
  }
});

function renderShifts(shifts) {
  shiftsContainer.innerHTML = shifts.map(s => `
    <div class="shift-card">
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <p><strong>Zeit:</strong>
         ${new Date(s.start_time).toLocaleString()} –
         ${new Date(s.end_time).toLocaleString()}
      </p>
      <p><strong>Erwartung:</strong> ${s.expectations}</p>
      <button data-shift-id="${s.id}">Anmelden</button>
    </div>
  `).join('');

  // jeden Button anclick binden
  shiftsContainer.querySelectorAll('button[data-shift-id]')
    .forEach(btn => btn.addEventListener('click', () => {
      showRegistrationFor(btn.dataset.shiftId);
    }));
}

function showRegistrationFor(shiftId) {
  regShiftIdField.value = shiftId;
  regMsg.textContent     = '';
  regContainer.style.display = 'block';
  regForm.scrollIntoView({ behavior: 'smooth' });
}

function hideRegistration() {
  regContainer.style.display = 'none';
  regForm.reset();
}

// 3) Formular abschicken
regForm.addEventListener('submit', async e => {
  e.preventDefault();
  const shift_id = +regShiftIdField.value;
  const email    = document.getElementById('reg-email').value.trim();
  const name     = document.getElementById('reg-name').value.trim() || null;

  try {
    await registerHelper({ shift_id, email, name });
    regMsg.style.color = 'green';
    regMsg.textContent = 'Danke! Dein Eintrag wurde gespeichert.';
    hideRegistration();
  } catch (err) {
    console.error('Fehler bei der Registrierung:', err);
    regMsg.style.color = 'red';
    regMsg.textContent = 'Fehler beim Speichern. Bitte versuche es später erneut.';
  }
});
