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

// 1) Veranstaltungen laden
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

// 2) Wenn der Benutzer eine Veranstaltung auswählt …
eventSelect.addEventListener('change', async (e) => {
  const eventId = +e.target.value;
  clearShifts();
  clearRegistration();
  if (!eventId) return;

  // 2a) Shifts und Counts holen
  const rawShifts = await fetchShifts(eventId);
  const shifts = await Promise.all(
    rawShifts.map(async s => ({
      ...s,
      taken: await fetchRegistrationsCount(s.id)
    }))
  );

  renderShifts(shifts);
  setupRegistration(shifts);
});

// Leert die Shift-Ansicht
function clearShifts() {
  shiftsContainer.innerHTML = '';
}

// Zeichnet alle Shifts-Karten mit Restplätzen
function renderShifts(shifts) {
  shiftsContainer.innerHTML = shifts.map(s => `
    <div class="shift-card">
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <p><strong>Zeit:</strong>
         ${new Date(s.start_time).toLocaleString()} – 
         ${new Date(s.end_time).toLocaleString()}</p>
      <p><strong>Erwartung:</strong> ${s.expectations}</p>
      <p><em>${s.max_helpers - s.taken} von ${s.max_helpers} frei</em></p>
    </div>
  `).join('');
}

// Versteckt das Registrierungsformular
function clearRegistration() {
  regContainer.style.display    = 'none';
  regShiftSelect.innerHTML      = '<option value="">-- bitte wählen --</option>';
  regMsg.textContent            = '';
}

// Befüllt Dropdown & zeigt das Registrierungsformular
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

// 3) Formular absenden: in DB eintragen und Counts/Karten neu rendern
regForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const shift_id = +regShiftSelect.value;
  const email    = document.getElementById('reg-email').value.trim();
  const name     = document.getElementById('reg-name').value.trim() || null;

  try {
    await registerHelper({ shift_id, email, name });
    regMsg.style.color   = 'green';
    regMsg.textContent   = 'Danke, deine Anmeldung ist eingegangen!';
    regForm.reset();

    // Karten und Dropdown aktualisieren
    const rawShifts = await fetchShifts(+eventSelect.value);
    const shifts = await Promise.all(
      rawShifts.map(async s => ({
        ...s,
        taken: await fetchRegistrationsCount(s.id)
      }))
    );
    renderShifts(shifts);
    setupRegistration(shifts);

  } catch (err) {
    console.error(err);
    regMsg.style.color   = 'red';
    regMsg.textContent   = 'Fehler bei der Anmeldung.';
  }
});
