import {
  fetchEvents,
  fetchShifts,
  fetchRegistrationsCount,
  registerHelper
} from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');

// 1) Events laden
async function loadEvents() {
  const events = await fetchEvents();
  // placeholder zurücksetzen
  eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
  events.forEach(e => {
    const opt = document.createElement('option');
    opt.value       = e.id;
    opt.textContent = `${e.name} (${e.date})`;
    eventSelect.appendChild(opt);
  });
}
loadEvents();

// 2) Wenn Event ausgewählt
eventSelect.addEventListener('change', async () => {
  const eventId = +eventSelect.value;
  shiftsContainer.innerHTML = '';
  if (!eventId) return;

  // Shifts abrufen
  const rawShifts = await fetchShifts(eventId);
  // pro Shift Anzahl Registrierungen holen
  const shifts = await Promise.all(
    rawShifts.map(async s => {
      const taken = await fetchRegistrationsCount(s.id);
      return { ...s, taken };
    })
  );

  renderShifts(shifts);
  bindHandlers();
});

// rendert die Karten
function renderShifts(shifts) {
  shiftsContainer.innerHTML = shifts
    .sort((a, b) =>
      a.title.localeCompare(b.title) ||
      new Date(a.start_time) - new Date(b.start_time)
    )
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

// setzt Click- und Submit-Handler
function bindHandlers() {
  // Formular anzeigen
  shiftsContainer.querySelectorAll('.btn-show-form')
    .forEach(btn => {
      btn.addEventListener('click', () => {
        shiftsContainer.querySelectorAll('.reg-form')
          .forEach(f => (f.style.display = 'none'));
        const form = btn.nextElementSibling;
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
      });
    });
  // Formular absenden
  shiftsContainer.querySelectorAll('.reg-form')
    .forEach(form => {
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
          // neu rendern
          eventSelect.dispatchEvent(new Event('change'));
        } catch (err) {
          msgEl.style.color = 'red';
          msgEl.textContent = err.message || 'Fehler bei der Anmeldung.';
        }
      });
    });
}
