// public/main.js
import { fetchEvents, fetchShifts } from './submit.js';

const eventSelect      = document.getElementById('event-select');
const shiftsContainer  = document.getElementById('shifts-container');

async function loadEvents() {
  try {
    console.log('▶ loadEvents() startet');
    const events = await fetchEvents();
    eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
    events.forEach(e => {
      const opt = document.createElement('option');
      opt.value       = e.id;
      opt.textContent = `${e.name} (${e.date})`;
      eventSelect.appendChild(opt);
    });
  } catch(err) {
    eventSelect.innerHTML = '<option>(Fehler beim Laden)</option>';
  }
}

eventSelect.addEventListener('change', e => {
  const id = e.target.value;
  if (id) renderShifts(id);
  else shiftsContainer.innerHTML = '';
});

async function renderShifts(eventId) {
  const shifts = await fetchShifts(eventId);
  shiftsContainer.innerHTML = shifts.map(s => `
    <div class="shift-card">
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <p><strong>Zeit:</strong> ${new Date(s.start_time).toLocaleString()} – ${new Date(s.end_time).toLocaleString()}</p>
      <p><strong>Erwartung:</strong> ${s.expectations}</p>
    </div>
  `).join('');
}

loadEvents();

// 2) Wenn Event gewählt wird, Shifts laden und Registrierung vorbereiten
eventSelect.addEventListener('change', async (e) => {
  const eventId = +e.target.value;
  clearShifts();
  clearRegistration();
  if (!eventId) return;

  const shifts = await fetchShifts(eventId);
  renderShifts(shifts);
  setupRegistration(shifts);
});

// Hilfsfunktionen
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
      <p><strong>Erwartung:</strong> ${s.expectations}</p>
    </div>
  `).join('');
}

function clearRegistration() {
  regContainer.style.display    = 'none';
  regShiftSelect.innerHTML      = '<option value="">-- bitte wählen --</option>';
  regMsg.textContent            = '';
}

function setupRegistration(shifts) {
  // Dropdown für Shifts befüllen
  regShiftSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
  shifts.forEach(s => {
    const opt = document.createElement('option');
    opt.value       = s.id;
    opt.textContent = `${s.title} (${new Date(s.start_time).toLocaleTimeString()})`;
    regShiftSelect.appendChild(opt);
  });
  // Formular zeigen
  regContainer.style.display = 'block';
}

// 3) Registrierung abschicken
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
  } catch (err) {
    console.error(err);
    regMsg.style.color   = 'red';
    regMsg.textContent   = 'Fehler bei der Anmeldung.';
  }
});
