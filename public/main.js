import {
  fetchEvents,
  fetchShifts,
  fetchRegistrationCount,
  registerHelper
} from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');
const regForm         = document.getElementById('reg-form');
const regEmail        = document.getElementById('reg-email');
const regName         = document.getElementById('reg-name');
const regMsg          = document.getElementById('reg-msg');
let selectedShiftId   = null;

// 1) Events in Dropdown laden
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

// 2) Wenn Event gewählt wird: Shifts anzeigen
eventSelect.addEventListener('change', async () => {
  const eventId = +eventSelect.value;
  shiftsContainer.innerHTML = '';
  clearRegistration();
  if (!eventId) return;

  const shifts = await fetchShifts(eventId);
  // für jede Schicht den Belegungsstand abfragen
  const counts = await Promise.all(shifts.map(s => fetchRegistrationCount(s.id)));
  renderShifts(shifts, counts);
});

// Shifts rendern
function renderShifts(shifts, counts) {
  shiftsContainer.innerHTML = shifts.map((s, i) => {
    const taken    = counts[i];
    const free     = s.max_helpers - taken;
    const disabled = free <= 0 ? 'disabled' : '';

    return `
      <div class="shift-card">
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <p><strong>Zeit:</strong> 
           ${new Date(s.start_time).toLocaleString()} – 
           ${new Date(s.end_time).toLocaleString()}</p>
        <p><strong>Erwartung:</strong> ${s.expectations}</p>
        <p><em>${taken} von ${s.max_helpers} besetzt, ${free} frei</em></p>
        <button class="btn-register" data-shift-id="${s.id}" ${disabled}>
          ${free>0 ? 'Anmelden' : 'Ausgebucht'}
        </button>
      </div>
    `;
  }).join('');

  // Listener für alle Anmelde-Buttons
  document.querySelectorAll('.btn-register').forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectedShiftId = +e.target.dataset.shiftId;
      // Formular freischalten
      document.getElementById('registration-container').scrollIntoView({ behavior: 'smooth' });
      document.getElementById('registration-container').style.display = 'block';
    });
  });
}

// Formular abschicken
regForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!selectedShiftId) return;
  try {
    await registerHelper({
      shift_id: selectedShiftId,
      email:    regEmail.value.trim(),
      name:     regName.value.trim() || null
    });
    regMsg.style.color         = 'green';
    regMsg.textContent         = 'Danke, deine Anmeldung ist eingegangen!';
    regForm.reset();
    // Karte für diesen Shift neu laden
    const btn = document.querySelector(`.btn-register[data-shift-id="${selectedShiftId}"]`);
    btn.textContent = '...';
    // nach kurzer Verzögerung Gesamt neu laden
    setTimeout(() => eventSelect.dispatchEvent(new Event('change')), 500);
  } catch (err) {
    console.error(err);
    regMsg.style.color   = 'red';
    regMsg.textContent   = err.message || 'Fehler bei der Anmeldung.';
  }
});

// Hilfsfunktion zum Zurücksetzen
function clearRegistration() {
  selectedShiftId = null;
  document.getElementById('registration-container').style.display = 'none';
  regMsg.textContent = '';
}
