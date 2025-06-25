import {
  fetchEvents,
  fetchShifts,
  registerHelper
} from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');

// 1) Beim Laden: Veranstaltungen aus Supabase ziehen
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

// 2) Wenn eine Veranstaltung gewählt wird, ihre Einsätze holen und rendern
eventSelect.addEventListener('change', async e => {
  shiftsContainer.innerHTML = '';
  const eventId = +e.target.value;
  if (!eventId) return;
  const shifts = await fetchShifts(eventId);
  renderShifts(shifts);
});

// 3) Shifts rendern – jeder nur einmal, mit eigenem Formular
function renderShifts(shifts) {
  shiftsContainer.innerHTML = shifts.map(s => `
    <div class="shift-card" data-shift-id="${s.id}">
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <p><strong>Zeit:</strong>
         ${new Date(s.start_time).toLocaleString()} – 
         ${new Date(s.end_time).toLocaleString()}</p>
      <p><strong>Erwartung:</strong> ${s.expectations}</p>
      <button class="select-shift">Diesen Einsatz wählen</button>
      <form class="reg-form">
        <input type="email" name="email" placeholder="E-Mail" required />
        <input type="text" name="name" placeholder="Name (optional)" />
        <button type="submit">Anmelden</button>
        <div class="reg-msg"></div>
      </form>
    </div>
  `).join('');
}

// 4) Event-Delegation für Auswahl und Abschicken
shiftsContainer.addEventListener('click', async e => {
  const card = e.target.closest('.shift-card');
  if (!card) return;

  // a) Klick auf "Diesen Einsatz wählen"
  if (e.target.matches('.select-shift')) {
    // alle Formulare schließen
    shiftsContainer.querySelectorAll('.reg-form')
      .forEach(f => f.style.display = 'none');
    // dieses öffnen
    const form = card.querySelector('.reg-form');
    form.style.display = 'block';
    // Scrollen falls nötig
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // b) Abschicken des Formulars
  if (e.target.matches('.reg-form button')) {
    e.preventDefault();
    const form = card.querySelector('.reg-form');
    const shift_id = +card.dataset.shiftId;
    const email    = form.email.value.trim();
    const name     = form.name.value.trim() || null;
    const msgEl    = form.querySelector('.reg-msg');

    try {
      await registerHelper({ shift_id, email, name });
      msgEl.style.color = 'green';
      msgEl.textContent = 'Danke, deine Anmeldung ist eingegangen!';
      form.reset();
    } catch (err) {
      console.error(err);
      msgEl.style.color = 'red';
      msgEl.textContent = 'Fehler bei der Anmeldung.';
    }
  }
});
