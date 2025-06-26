import { fetchEvents, fetchShifts } from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');

async function loadEvents() {
  try {
    const events = await fetchEvents();
    eventSelect.innerHTML = [
      `<option value="">-- bitte wählen --</option>`,
      ...events.map(e =>
        `<option value="${e.id}">${e.name} (${e.date})</option>`
      )
    ].join('');
  } catch (err) {
    console.error(err);
    eventSelect.innerHTML = `<option value="">(Fehler beim Laden)</option>`;
  }
}

async function onEventChange() {
  const eventId = eventSelect.value;
  shiftsContainer.innerHTML = '';
  if (!eventId) {
    shiftsContainer.innerHTML = `<p class="info">Bitte wähle oben eine Veranstaltung aus.</p>`;
    return;
  }
  try {
    const shifts = await fetchShifts(+eventId);
    if (shifts.length === 0) {
      shiftsContainer.innerHTML = `<p class="info">Keine Einsätze gefunden.</p>`;
    } else {
      shiftsContainer.innerHTML = shifts.map(s => `
        <div class="shift-card">
          <h3>${s.title}</h3>
          <p>${s.description}</p>
          <p><strong>Zeit:</strong>
            ${new Date(s.start_time).toLocaleString()} – 
            ${new Date(s.end_time).toLocaleString()}
          </p>
          <p><strong>Erwartung:</strong> ${s.expectations}</p>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error(err);
    shiftsContainer.innerHTML = `<p class="info">(Fehler beim Laden der Einsätze)</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadEvents();
  shiftsContainer.innerHTML = `<p class="info">Bitte wähle oben eine Veranstaltung aus.</p>`;
  eventSelect.addEventListener('change', onEventChange);
});
