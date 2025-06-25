import {
  fetchEvents,
  fetchShifts,
  registerHelper
} from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');

// 1) Events laden
async function loadEvents() {
  try {
    const events = await fetchEvents();
    eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
    events.forEach(e => {
      const opt = document.createElement('option');
      opt.value       = e.id;
      opt.textContent = `${e.name} (${e.date})`;
      eventSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Fehler beim Laden der Events:', err);
    eventSelect.innerHTML = '<option value="">(Fehler beim Laden)</option>';
  }
}
loadEvents();

// 2) Nach Event-Auswahl Shifts laden und anzeigen
eventSelect.addEventListener('change', async () => {
  const eventId = +eventSelect.value;
  shiftsContainer.innerHTML = '';
  if (!eventId) return;

  try {
    const shifts = await fetchShifts(eventId);
    renderShifts(shifts);
    bindHandlers();
  } catch (err) {
    console.error('Fehler beim Laden der Shifts:', err);
    shiftsContainer.innerHTML = '<p style="color:red">Fehler beim Laden der Einsätze.</p>';
  }
});

/**
 * Zeichnet die Shift-Cards mit Inline-Formular
 */
function renderShifts(shifts) {
  shiftsContainer.innerHTML = shifts
    .map(s => {
      const free     = s.max_helpers - s.taken;
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

/**
 * Verknüpft Button- und Submit-Handler
 */
function bindHandlers() {
  // 1) „Anmelden“-Button öffnet das Inline-Formular
  shiftsContainer.querySelectorAll('.btn-show-form').forEach(btn => {
    btn.addEventListener('click', () => {
      shiftsContainer.querySelectorAll('.reg-form')
        .forEach(f => (f.style.display = 'none'));
      const form = btn.nextElementSibling;
      form.style.display = 'block';
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // 2) Formular-Submit pro Karte
  shiftsContainer.querySelectorAll('.reg-form').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const card     = form.closest('.shift-card');
      const shift_id = +card.dataset.id;
      const email    = form.email.value.trim();
      const name     = form.name.value.trim() || null;
      const msgEl    = form.querySelector('.reg-msg');

      try {
        // a) in DB speichern
        await registerHelper({ shift_id, email, name });

        // b) Erfolgsmeldung anzeigen
        msgEl.style.color   = 'green';
        msgEl.textContent   = 'Danke, deine Anmeldung ist eingegangen!';

        // c) Mail an Uwe öffnen
        const shiftTitle = card.querySelector('h3').textContent;
        const subject    = encodeURIComponent('Neue Helfer-Registrierung');
        const body       = encodeURIComponent(
          `Name: ${name || '(kein Name)'}\n` +
          `E-Mail: ${email}\n` +
          `Einsatz: ${shiftTitle}`
        );
        window.open(
          `mailto:uwe.baumann@ortsverein-frauenkappelen.ch?subject=${subject}&body=${body}`,
          '_blank'
        );

        // d) Form zurücksetzen und Shifts neu laden
        form.reset();
        eventSelect.dispatchEvent(new Event('change'));

      } catch (err) {
        console.error(err);
        msgEl.style.color   = 'red';
        msgEl.textContent   = 'Fehler bei der Anmeldung.';
      }
    });
  });
}
