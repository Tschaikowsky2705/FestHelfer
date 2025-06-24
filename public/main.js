import { fetchEvents, fetchShifts, registerHelper } from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');
const shiftsMessage   = document.getElementById('shifts-message');
const regForm         = document.getElementById('reg-form');
const regEventSelect  = document.getElementById('reg-event');
const regMsg          = document.getElementById('reg-msg');

async function loadEvents() {
  try {
    const events = await fetchEvents();
    // beide Dropdowns neu füllen
    eventSelect.innerHTML    = '<option value="">-- bitte wählen --</option>';
    regEventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
    events.forEach(e => {
      const opt = document.createElement('option');
      opt.value       = e.id;
      opt.textContent = `${e.name} (${e.date})`;
      eventSelect.appendChild(opt);
      regEventSelect.appendChild(opt.cloneNode(true));
    });
  } catch (err) {
    console.error('Fehler beim Laden der Veranstaltungen', err);
    eventSelect.innerHTML    = '<option value="">(Fehler beim Laden)</option>';
    regEventSelect.innerHTML = '<option value="">(Fehler beim Laden)</option>';
  }
}

async function renderShifts(eventId) {
  if (!eventId) {
    shiftsContainer.innerHTML = '';
    shiftsMessage.textContent = 'Bitte wähle oben eine Veranstaltung aus, um die Einsätze zu sehen.';
    return;
  }
  try {
    const shifts = await fetchShifts(eventId);
    if (shifts.length === 0) {
      shiftsContainer.innerHTML = '';
      shiftsMessage.textContent = 'Für diese Veranstaltung sind keine Einsätze hinterlegt.';
    } else {
      shiftsMessage.textContent = '';
      shiftsContainer.innerHTML = shifts.map(s => `
        <div class="shift-card">
          <h3>${s.title}</h3>
          <p>${s.description}</p>
          <p><strong>Zeit:</strong> ${new Date(s.start_time).toLocaleString()} – ${new Date(s.end_time).toLocaleString()}</p>
          <p><strong>Erwartung:</strong> ${s.expectations}</p>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Fehler beim Laden der Einsätze', err);
    shiftsContainer.innerHTML = '';
    shiftsMessage.textContent = 'Fehler beim Laden der Einsätze.';
  }
}

regForm.addEventListener('submit', async e => {
  e.preventDefault();
  const event_id = +regEventSelect.value;
  const email    = document.getElementById('reg-email').value.trim();
  const name     = document.getElementById('reg-name').value.trim() || null;
  regMsg.textContent = '';
  try {
    await registerHelper({ event_id, email, name });
    regMsg.style.color   = 'green';
    regMsg.textContent   = 'Danke, du bist angemeldet!';
    regForm.reset();
  } catch (err) {
    console.error('Registrierungs-Fehler', err);
    regMsg.style.color   = 'red';
    regMsg.textContent   = 'Fehler bei der Anmeldung.';
  }
});

eventSelect.addEventListener('change', e => renderShifts(e.target.value));

// Initial-Aufrufe
loadEvents();
renderShifts();
