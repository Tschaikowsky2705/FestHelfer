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
    // erstes Default‐Option
    eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
    // jede Veranstaltung als Option anhängen
    events.forEach(e => {
      const opt = document.createElement('option');
      opt.value       = e.id;
      opt.textContent = `${e.name} (${e.date})`;
      eventSelect.appendChild(opt);
    });
    // wenn Du willst, direkt den ersten auswählen:
    // if (events.length) eventSelect.value = events[0].id;
  } catch (err) {
    console.error('❌ Fehler beim Laden der Veranstaltungen', err);
    eventSelect.innerHTML = '<option>(Fehler beim Laden)</option>';
  }
}

/**
 * Rendert die Shifts für das gewählte Event.
 */
async function handleEventChange() {
  const eventId = eventSelect.value;
  // wenn nichts gewählt, leeren
  if (!eventId) {
    shiftsContainer.innerHTML = '';
    return;
  }
  try {
    const shifts = await fetchShifts(+eventId);
    // nach Titel sortieren, dann nach Zeit
    shifts.sort((a, b) => {
      if (a.title < b.title) return -1;
      if (a.title > b.title) return  1;
      return new Date(a.start_time) - new Date(b.start_time);
    });
    // Ausgabe
    shiftsContainer.innerHTML = shifts.map(s => `
      <div class="shift-card">
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <p>
          <strong>Zeit:</strong>
          ${new Date(s.start_time).toLocaleString()} – 
          ${new Date(s.end_time)  .toLocaleString()}
        </p>
      </div>
    `).join('');
  } catch (err) {
    console.error('❌ Fehler beim Laden der Einsätze', err);
    shiftsContainer.innerHTML = '<p>Fehler beim Laden der Einsätze</p>';
  }
}

//
// Setup
//
if (!eventSelect) {
  console.error('Element #event-select nicht gefunden!');
} else {
  // beim Wechsel neu laden
  eventSelect.addEventListener('change', handleEventChange);
  // und beim Start alle Events laden
  loadEvents();
}
