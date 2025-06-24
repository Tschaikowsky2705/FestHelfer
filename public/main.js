import { fetchEvents, fetchShifts } from './submit.js';

const eventSelect      = document.getElementById('event-select');
const shiftsContainer  = document.getElementById('shifts-container');

/**
 * Lädt die Events, befüllt das Dropdown und zeigt direkt die ersten Shifts.
 */
async function loadEvents() {
  try {
    console.log('🔄 loadEvents() startet');
    const events = await fetchEvents();

    // Dropdown füllen
    eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
    events.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = `${e.name} (${e.date})`;
      eventSelect.appendChild(opt);
    });

    // Wenn mindestens ein Event da ist, direkt einmal rendern
    if (events.length > 0) {
      renderShifts(events[0].id);
    }
  } catch (err) {
    console.error('❌ Fehler in loadEvents():', err);
    shiftsContainer.innerHTML = '<p class="error-message">(Fehler beim Laden der Veranstaltungen)</p>';
  }
}

/**
 * Lädt und zeigt die Shifts für ein einzelnes Event in Card-Optik.
 */
async function renderShifts(eventId) {
  try {
    console.log('🔄 renderShifts() für Event', eventId);
    const shifts = await fetchShifts(eventId);

    // **Das ist die EINZIGE Stelle, wo wir Shifts rendern!**
    shiftsContainer.innerHTML = shifts.map(s => `
      <div class="shift-card">
        <strong>${s.title}</strong>
        <p>${s.description}</p>
        <p class="shift-time">
          Zeit: ${new Date(s.start_time).toLocaleString()} – ${new Date(s.end_time).toLocaleString()}
        </p>
        <p class="shift-expectation">
          Erwartung: ${s.expectations}
        </p>
      </div>
    `).join('');
  } catch (err) {
    console.error('❌ Fehler in renderShifts():', err);
    shiftsContainer.innerHTML = '<p class="error-message">(Fehler beim Laden der Einsätze)</p>';
  }
}

// Event-Listener fürs Dropdown
eventSelect.addEventListener('change', e => {
  const id = e.target.value;
  if (id) renderShifts(id);
});

// App starten
loadEvents();
