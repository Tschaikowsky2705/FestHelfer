// public/main.js
import { fetchEvents, fetchShifts, registerHelper } from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');
const regContainer    = document.getElementById('registration-container');
const regShiftSelect  = document.getElementById('reg-shift');
const regForm         = document.getElementById('reg-form');
const regMsg          = document.getElementById('reg-msg');

// 1) Beim Laden: Veranstaltungen holen
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
    eventSelect.innerHTML = `<option value="">(Fehler beim Laden)</option>`;
  }
}
loadEvents();

// 2) Wenn Event gewählt: Shifts und Registrierung aufbauen
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
    console.error('Fehler beim Laden der Einsätze:', err);
    shiftsContainer.innerHTML = `<p style="color:red;">Einsätze konnten nicht geladen werden.</p>`;
  }
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
        ${new Date(s.end_time).toLocaleString()}
      </p>
      <p><strong>Erwartung:</strong> ${s.expectations}</p>
      <button data-shift-id="${s.id}" class="btn-choose">Anmelden</button>
    </div>
  `).join('');

  // Buttons „Anmelden“ auf jede Karte binden
  document.querySelectorAll('.btn-choose').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = +btn.getAttribute('data-shift-id');
      regShiftSelect.value = id;
      regContainer.style.display = 'block';
      // Scroll zur Anmeldung
      regContainer.scrollIntoView({ behavior: 'smooth' });
    });
  });
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
  // Formular anzeigen
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
    regMsg.textContent   = 'Danke! Dein Eintrag wurde gespeichert.';
    regForm.reset();
    // optional: verschwindet die Box wieder?
    // setTimeout(() => clearRegistration(), 2000);
  } catch (err) {
    console.error('Fehler bei der Anmeldung:', err);
    regMsg.style.color   = 'red';
    regMsg.textContent   = 'Fehler beim Speichern. Bitte versuche es später erneut.';
  }
});
