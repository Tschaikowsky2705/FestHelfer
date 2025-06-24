import { fetchEvents, fetchShifts } from './submit.js';

const eventSelect = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');

async function loadEvents() {
  const events = await fetchEvents();
  eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
  events.forEach(e => {
    const opt = document.createElement('option');
    opt.value = e.id;
    opt.textContent = `${e.name} (${e.date})`;
    eventSelect.appendChild(opt);
  });
  if(events.length) renderShifts(events[0].id);
}

async function renderShifts(eventId) {
  const shifts = await fetchShifts(eventId);
  shiftsContainer.innerHTML = shifts.map(s => `
    <div style="margin-bottom:1em;">
      <strong>${s.title}</strong><br/>
      ${s.description}<br/>
      Zeit: ${new Date(s.start_time).toLocaleString()} - ${new Date(s.end_time).toLocaleString()}<br/>
      Erwartung: ${s.expectations}
    </div>
  `).join('');
}

eventSelect.addEventListener('change', e => renderShifts(e.target.value));

loadEvents();