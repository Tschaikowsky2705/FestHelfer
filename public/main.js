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

// 1) Events laden
async function loadEvents() {
  console.log('🔄 loadEvents()');
  const events = await fetchEvents();
  console.log('🎉 Events:', events);
  eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
  events.forEach(e => {
    const opt = document.createElement('option');
    opt.value       = e.id;
    opt.textContent = `${e.name} (${e.date})`;
    eventSelect.appendChild(opt);
  });
}
loadEvents();

eventSelect.addEventListener('change', async e => {
  const eventId = +e.target.value;
  console.log('👉 Veranstaltung ausgewählt:', eventId);
  clearShifts();
  clearRegistration();
  if (!eventId) return;

  // 2) Shifts holen
  try {
    const rawShifts = await fetchShifts(eventId);
    console.log('🕒 rawShifts:', rawShifts);
    const shifts = await Promise.all(rawShifts.map(async s => {
      let taken = 0;
      try {
        taken = await fetchRegistrationsCount(s.id);
      } catch(err) {
        console.error('❌ fetchRegistrationsCount failed for', s.id, err);
      }
      return { ...s, taken };
    }));
    console.log('✅ shifts mit Counts:', shifts);
    renderShifts(shifts);
    setupRegistration(shifts);
  } catch(err) {
    console.error('❌ Fehler beim Laden der Shifts:', err);
    shiftsContainer.innerHTML = `<p style="color:red">Fehler beim Laden der Einsätze.</p>`;
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
         ${new Date(s.start_time).toLocaleString()} – 
         ${new Date(s.end_time).toLocaleString()}</p>
      <p><em>${s.max_helpers - s.taken} von ${s.max_helpers} frei</em></p>
    </div>
  `).join('');
}

function clearRegistration() {
  regContainer.style.display    = 'none';
  regShiftSelect.innerHTML      = '<option value="">-- bitte wählen --</option>';
  regMsg.textContent            = '';
}

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
    // … hier falls gewünscht noch ein Reload der Shifts …
  } catch (err) {
    console.error(err);
    regMsg.style.color   = 'red';
    regMsg.textContent   = 'Fehler bei der Anmeldung.';
  }
});
