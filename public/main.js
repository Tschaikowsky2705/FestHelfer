import {
  fetchEvents,
  fetchShifts,
  registerHelper
} from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');

// 1) Events in Dropdown laden
async function loadEvents() {
  const events = await fetchEvents();
  eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
  events.forEach(e => {
    const opt = document.createElement('option');
    opt.value       = e.id;
    opt.textContent = `${e.name} (${e.date})`;
    eventSelect.appendChild(opt);
  });
}
loadEvents();

// 2) Nach Event-Auswahl die Shifts + taken laden und rendern
eventSelect.addEventListener('change', async () => {
  const eventId = +eventSelect.value;
  shiftsContainer.innerHTML = '';
  if (!eventId) return;

  // a) Shifts mit registrations holen
  const shifts = await fetchShifts(eventId);

  // b) rendern und Handler binden
  renderShifts(shifts);
  bindHandlers();
});

// Rendert jede Shift als Card mit Taken-Berechnung
function renderShifts(shifts) {
  shiftsContainer.innerHTML = shifts
    .map(s => {
      const free = s.max_helpers - s.taken;
      const disabled = free <= 0 ? 'disabled' : '';
      return `
      <div class="shift-card" data-id="${s.id}">
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <p><strong>Zeit:</strong>
           ${new Date(s.start_time).toLocaleString()} – 
           ${new Date(s.end_time).toLocaleString()}
        </p>
        <p><em>${free} von ${s.max_helpers} Plätzen frei</em></p>
        <button class="btn-show-form" ${disabled}>
          ${free > 0 ? 'Anmelden' : 'Ausgebucht'}
        </button>
        <form class="reg-form">
          <input type="email" name="email" placeholder="E-Mail" required />
          <input type="text"  name="name"  placeholder="Name (optional)" />
          <button type="submit">Absenden</button>
          <p class="reg-msg"></p>
        </form>
      </div>`;
    })
    .join('');
}

// Bindet Klick- und Submit-Handler auf jede Karte
function bindHandlers() {
  // „Anmelden“-Button öffnet das Inline-Formular
  shiftsContainer.querySelectorAll('.btn-show-form').forEach(btn => {
    btn.addEventListener('click', () => {
      // alle anderen schließen
      shiftsContainer.querySelectorAll('.reg-form')
        .forEach(f => (f.style.display = 'none'));
      // dieses öffnen
      const form = btn.nextElementSibling;
      form.style.display = 'block';
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // Formular-Submit je Karte
  shiftsContainer.querySelectorAll('.reg-form').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const card     = form.closest('.shift-card');
      const shift_id = +card.dataset.id;
      const email    = form.email.value.trim();
      const name     = form.name.value.trim() || null;
      const msgEl    = form.querySelector('.reg-msg');

      try {
        await registerHelper({ shift_id, email, name });
        msgEl.style.color = 'green';
        msgEl.textContent = 'Danke, deine Anmeldung ist eingegangen!';
        form.reset();
        // Refresh: neu rendern
        eventSelect.dispatchEvent(new Event('change'));
      } catch (err) {
        console.error(err);
        msgEl.style.color = 'red';
        msgEl.textContent = err.message || 'Fehler bei der Anmeldung.';
      }
    });
  });
}
