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
  eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
  events.forEach(e => {
    const opt = document.createElement('option');
    opt.value       = e.id;
    opt.textContent = `${e.name} (${e.date})`;
    eventSelect.appendChild(opt);
  });
}
loadEvents();

// 2) Wenn Event gewählt
eventSelect.addEventListener('change', async () => {
  const eventId = +eventSelect.value;
  shiftsContainer.innerHTML = '';
  if (!eventId) return;
  // a) alle Shifts holen
  const raw = await fetchShifts(eventId);
  // b) pro Shift die aktuelle Belegung holen
  const shifts = await Promise.all(raw.map(async s => {
    const taken = await fetchRegistrationsCount(s.id);
    return { ...s, taken };
  }));
  // c) anzeigen
  renderShifts(shifts);
  bindRegistrationHandlers();
});

// Rendert die Cards mit Inline-Form
function renderShifts(shifts) {
  shiftsContainer.innerHTML = shifts
    // zuerst nach Titel, dann Zeit sortieren
    .sort((a,b) => a.title.localeCompare(b.title) || new Date(a.start_time) - new Date(b.start_time))
    .map(s => `
      <div class="shift-card" data-id="${s.id}">
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <p><strong>Zeit:</strong>
           ${new Date(s.start_time).toLocaleString()} – 
           ${new Date(s.end_time).toLocaleString()}
        </p>
        <p><em>${s.max_helpers - s.taken} von ${s.max_helpers} frei</em></p>
        <button class="btn-show-form"${s.taken >= s.max_helpers ? ' disabled' : ''}>
          ${s.taken >= s.max_helpers ? 'Ausgebucht' : 'Anmelden'}
        </button>
        <form class="reg-form" style="display:none">
          <input type="email" name="email" placeholder="E-Mail" required />
          <input type="text"  name="name"  placeholder="Name (optional)" />
          <button type="submit">Absenden</button>
          <p class="reg-msg"></p>
        </form>
      </div>
    `).join('');
}

// Verknüpft Button- und Submit-Handler
function bindRegistrationHandlers() {
  shiftsContainer.querySelectorAll('.btn-show-form')
    .forEach(btn => {
      btn.addEventListener('click', () => {
        // alle anderen schließen
        shiftsContainer.querySelectorAll('.reg-form')
          .forEach(f => f.style.display = 'none');
        // dieses aufklappen
        const form = btn.nextElementSibling;
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
      });
    });

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
          // optional: Button deaktivieren, wenn ausgebucht
        } catch (err) {
          console.error(err);
          msgEl.style.color = 'red';
          msgEl.textContent = 'Fehler bei der Anmeldung.';
        }
      });
    });
}
