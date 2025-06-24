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
    const shifts = await fetchShifts(eventId);
    shiftsContainer.innerHTML = shifts.map(s => `
-     <div style="margin-bottom:1em;">
-       <strong>${s.title}</strong><br/>
-       ${s.description}<br/>
-       Zeit: ${new Date(s.start_time).toLocaleString()} - ${new Date(s.end_time).toLocaleString()}<br/>
-       Erwartung: ${s.expectations}
-     </div>
+     <div class="shift-card">
+       <strong>${s.title}</strong>
+       <div>${s.description}</div>
+       <div class="shift-time">
+         Zeit: ${new Date(s.start_time).toLocaleString()} – ${new Date(s.end_time).toLocaleString()}
+       </div>
+       <div class="shift-expectation">
+         Erwartung: ${s.expectations}
+       </div>
+     </div>
    `).join('');
  } catch (err) {
    shiftsContainer.innerHTML = '<p class="error-message">(Fehler beim Laden der Einsätze)</p>';
  }
}

eventSelect.addEventListener('change', e => renderShifts(e.target.value));

loadEvents();
