import {
  fetchEvents,
  fetchShifts,
  fetchRegistrationsCount,
  registerHelper
} from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');
const regContainer    = document.getElementById('registration-container');
const regShiftSelect  = document.getElementById('reg-shift');
const regForm         = document.getElementById('reg-form');
const regMsg          = document.getElementById('reg-msg');

// 1) Beim Laden: Veranstaltungen ziehen und Dropdown füllen
async function loadEvents() {
  const events = await fetchEvents();
  eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
  events.forEach(e => {
    const opt = document.createElement('option');
    opt.value       = e.id;
    opt.textContent = `${e.name} (${e.date})`;
    eventSelect.appendChild(opt);
  });
}
loadEvents();

// 2) Wenn eine Veranstaltung ausgewählt wird
eventSelect.addEventListener('change', async e => {
  const eventId = +e.target.value;
  clearShifts();
  clearRegistration();
  if (!eventId) return;

  // a) Shifts holen
  const rawShifts = await fetchShifts(eventId);

  // b) Für jedes Shift die aktuellen Anmeldungen zählen
  const shifts = await Promise.all(rawShifts.map(async s => {
    const taken = await fetchRegistrationsCount(s.id);
    return { ...s, taken };
  }));

  // c) Shifts anzeigen und Registrierungs-Dropdown vorbereiten
  renderShifts(shifts);
  setupRegistration(shifts);
});

// Leert die Card-Liste
function clearShifts() {
  shiftsContainer.innerHTML = '';
}

// Rendert die einzelnen Shift-Cards inkl. freier Plätze
function renderShifts(shifts) {
  shiftsContainer.innerHTML = shifts.map(s => `
    <div class="shift-card">
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <p><strong>Zeit:</strong>
         ${new Date(s.start_time).toLocaleString()} – 
         ${new Date(s.end_time).toLocaleString()}
      </p>
      <p><em>${s.max_helpers - s.taken} von ${s.max_helpers} frei</em></p>
    </div>
  `).join('');
}

// Blendet das Registrierungsformular aus und leert es
function clearRegistration() {
  regContainer.style.display = 'none';
  regShiftSelect.innerHTML   = '<option value="">-- bitte wählen --</option>';
  regMsg.textContent         = '';
}

// Füllt das Dropdown & zeigt das Formular
function setupRegistration(shifts) {
  regShiftSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
  shifts.forEach(s => {
    const opt = document.createElement('option');
    opt.value       = s.id;
    opt.textContent = `${s.title} (${new Date(s.start_time).toLocaleTimeString()})`;
    regShiftSelect.appendChild(opt);
  });
  regContainer.style.display = 'block';
}

// 3) Beim Abschicken: Helper registrieren
regForm.addEventListener('submit', async e => {
  e.preventDefault();
  const shift_id = +regShiftSelect.value;
  const email    = document.getElementById('reg-email').value.trim();
  const name     = document.getElementById('reg-name').value.trim() || null;

  try {
    await registerHelper({ shift_id, email, name });
    regMsg.style.color   = 'green';
    regMsg.textContent   = 'Danke, deine Anmeldung ist eingegangen!';
    regForm.reset();
  } catch (err) {
    console.error(err);
    regMsg.style.color   = 'red';
    regMsg.textContent   = 'Fehler bei der Anmeldung.';
  }
});
