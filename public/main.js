// main.js
import { fetchEvents, fetchShifts } from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');

/**
 * Lädt alle Events aus Supabase und füllt das Dropdown.
 */
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
    console.error('❌ Fehler beim Laden der Veranstaltungen', err);
    eventSelect.innerHTML = '<option>(Fehler beim Laden)</option>';
  }
}

/**
 * Rendert die Shifts für das gewählte Event,
 * sortiert nach Titel (alphabetisch) und Startzeit.
 */
async function handleEventChange() {
  const eventId = eventSelect.value;
  if (!eventId) {
    shiftsContainer.innerHTML = '';
    return;
  }
  try {
    let shifts = await fetchShifts(+eventId);

    // 1) nach Titel alphabetisch
    shifts.sort((a, b) => a.title.localeCompare(b.title)
      || new Date(a.start_time) - new Date(b.start_time));

    // 2) HTML zusammenbauen, jetzt inklusive Erwartung
    shiftsContainer.innerHTML = shifts.map(s => `
      <div class="shift-card">
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <p>
          <strong>Zeit:</strong>
          ${new Date(s.start_time).toLocaleString()} – 
          ${new Date(s.end_time)  .toLocaleString()}
        </p>
        <p>
          <strong>Erwartung:</strong>
          ${s.expectations}
        </p>
        <button data-shift="${s.id}" class="btn-signup">Anmelden</button>
      </div>
    `).join('');
  } catch (err) {
    console.error('❌ Fehler beim Laden der Einsätze', err);
    shiftsContainer.innerHTML = '<p>Fehler beim Laden der Einsätze</p>';
  }
}

//
// Event-Handler registrieren & initiales Laden
//
if (!eventSelect) {
  console.error('Element #event-select nicht gefunden!');
} else {
  eventSelect.addEventListener('change', handleEventChange);
  loadEvents();
}
