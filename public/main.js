import { fetchEvents, fetchShifts } from './submit.js';

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
