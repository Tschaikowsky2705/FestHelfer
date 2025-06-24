import { fetchEvents, fetchShifts } from './submit.js';

const eventSelect      = document.getElementById('event-select');
const shiftsContainer  = document.getElementById('shifts-container');

// --- Hier ergänzt: Fehler-Logging in loadEvents
async function loadEvents() {
  try {
    console.log('🔄 loadEvents() startet');
    const events = await fetchEvents();
    console.log('✅ fetchEvents liefert:', events);
    eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
    events.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = `${e.name} (${e.date})`;
      eventSelect.appendChild(opt);
    });
    if (events.length) renderShifts(events[0].id);
  } catch (err) {
    console.error('❌ Fehler in loadEvents():', err);
    eventSelect.innerHTML = '<option value="">(Fehler beim Laden)</option>';
  }
}

async function renderShifts(eventId) {
  try {
    console.log(`🔄 renderShifts(${eventId}) startet`);
    const shifts = await fetchShifts(eventId);
    console.log('✅ fetchShifts liefert:', shifts);
    shiftsContainer.innerHTML = shifts.map(s => `
      <div style="margin-bottom:1em;">
        <strong>${s.title}</strong><br/>
        ${s.description}<br/>
        Zeit: ${new Date(s.start_time).toLocaleString()} - ${new Date(s.end_time).toLocaleString()}<br/>
        Erwartung: ${s.expectations}
      </div>
    `).join('');
  } catch (err) {
    console.error('❌ Fehler in renderShifts():', err);
    shiftsContainer.innerHTML = '<p>(Fehler beim Laden der Einsätze)</p>';
  }
}

eventSelect.addEventListener('change', e => renderShifts(e.target.value));

loadEvents();
