import { fetchEvents, fetchShifts, registerHelper } from './submit.js';

const eventSelect    = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');

function showPleaseSelect() {
  shiftsContainer.innerHTML = `
    <p class="error-message">
      Bitte wähle oben eine Veranstaltung aus, um die Einsätze zu sehen.
    </p>
  `;
}

async function loadEvents() {
  const events = await fetchEvents();
  eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
  events.forEach(e => {
    const opt = document.createElement('option');
    opt.value = e.id;
    opt.textContent = `${e.name} (${e.date})`;
    eventSelect.appendChild(opt);
  });
  showPleaseSelect();
}

async function renderShifts(eventId) {
  const shifts = await fetchShifts(eventId);
  shiftsContainer.innerHTML = shifts.map(s => `
    <div class="shift-card">
      <strong>${s.title}</strong>
      <p>${s.description}</p>
      <p class="shift-time">
        Zeit: ${new Date(s.start_time).toLocaleString()} – ${new Date(s.end_time).toLocaleString()}
      </p>
      <p class="shift-expectation">Erwartung: ${s.expectations}</p>
    </div>
  `).join('');
}

eventSelect.addEventListener('change', e => {
  const id = e.target.value;
  if (id) renderShifts(id);
  else    showPleaseSelect();
});

loadEvents();
const regEventSelect = document.getElementById('reg-event');
async function loadRegEvents() {
  const events = await fetchEvents();
  events.forEach(e => {
    const opt = document.createElement('option');
    opt.value = e.id;
    opt.textContent = `${e.name} (${e.date})`;
    regEventSelect.appendChild(opt);
  });
}

// 2. Formular-Submit verarbeiten
const regForm = document.getElementById('reg-form');
const regMsg  = document.getElementById('reg-msg');

regForm.addEventListener('submit', async e => {
  e.preventDefault();
  regMsg.textContent = '';
  const event_id = +regEventSelect.value;
  const email    = document.getElementById('reg-email').value.trim();
  const name     = document.getElementById('reg-name').value.trim();
  try {
    await registerHelper({ event_id, email, name });
    regMsg.textContent = 'Danke, du bist angemeldet!';
    regForm.reset();
  } catch (err) {
    console.error(err);
    regMsg.style.color = 'red';
    regMsg.textContent = 'Fehler bei der Anmeldung.';
  }
});
