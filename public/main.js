import {
  fetchEvents,
  fetchShifts,
  registerHelper
} from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');

console.log('main.js geladen');

// 1) Events laden
async function loadEvents() {
  console.log('main.js → loadEvents()');
  try {
    const events = await fetchEvents();
    console.log('main.js → Events:', events);
    eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
    events.forEach(e => {
      const opt = document.createElement('option');
      opt.value       = e.id;
      opt.textContent = `${e.name} (${e.date})`;
      eventSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('main.js → loadEvents ERROR:', err);
    eventSelect.innerHTML = '<option value="">(Fehler beim Laden der Veranstaltungen)</option>';
  }
}
loadEvents();

// 2) Bei Änderung Event → Shifts laden
eventSelect.addEventListener('change', async () => {
  const eventId = +eventSelect.value;
  console.log('main.js → Event ausgewählt:', eventId);
  shiftsContainer.innerHTML = '';
  if (!eventId) return;

  try {
    const shifts = await fetchShifts(eventId);
    console.log('main.js → Shifts:', shifts);
    renderShifts(shifts);
    bindHandlers();
  } catch (err) {
    console.error('main.js → fetchShifts ERROR:', err);
    shiftsContainer.innerHTML = '<p style="color:red;">(Fehler beim Laden der Einsätze)</p>';
  }
});

function renderShifts(shifts) {
  shiftsContainer.innerHTML = shifts
    .map(s => {
      const free     = s.max_helpers - s.taken;
      const disabled = free <= 0 ? 'disabled' : '';
      return `
      <div class="shift-card" data-id="${s.id}">
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <p><strong>Zeit:</strong> ${new Date(s.start_time).toLocaleString()} – ${new Date(s.end_time).toLocaleString()}</p>
        <p><em>${free} von ${s.max_helpers} frei</em></p>
        <button class="btn-show-form" ${disabled}>${free>0?'Anmelden':'Ausgebucht'}</button>
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

function bindHandlers() {
  shiftsContainer.querySelectorAll('.btn-show-form').forEach(btn => {
    btn.addEventListener('click', () => {
      shiftsContainer.querySelectorAll('.reg-form').forEach(f => f.style.display = 'none');
      const form = btn.nextElementSibling;
      form.style.display = 'block';
      form.scrollIntoView({ behavior:'smooth' });
    });
  });
  shiftsContainer.querySelectorAll('.reg-form').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const card     = form.closest('.shift-card');
      const shift_id = +card.dataset.id;
      const email    = form.email.value.trim();
      const name     = form.name.value.trim() || null;
      const msgEl    = form.querySelector('.reg-msg');
      console.log('main.js → submit for shift', shift_id, email, name);
      try {
        await registerHelper({ shift_id, email, name });
        msgEl.style.color   = 'green';
        msgEl.textContent   = 'Danke, deine Anmeldung ist eingegangen!';
        form.reset();
        eventSelect.dispatchEvent(new Event('change'));
      } catch (err) {
        console.error('main.js → registerHelper ERROR:', err);
        msgEl.style.color   = 'red';
        msgEl.textContent   = 'Fehler bei der Anmeldung.';
      }
    });
  });
}
