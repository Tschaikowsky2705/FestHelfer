import { fetchEvents, fetchShifts, registerHelper } from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');

// 1)—Veranstaltungen laden
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
    console.error('Fehler beim Laden der Veranstaltungen:', err);
    eventSelect.innerHTML = '<option>(Fehler beim Laden)</option>';
  }
}
loadEvents();

// 2)—Beim Wechsel der Veranstaltung: Shifts holen und rendern
eventSelect.addEventListener('change', async () => {
  const eventId = +eventSelect.value;
  shiftsContainer.innerHTML = '';
  if (!eventId) return;

  try {
    const shifts = await fetchShifts(eventId);
    renderShifts(shifts);
  } catch (err) {
    console.error('Fehler beim Laden der Einsätze:', err);
    shiftsContainer.innerHTML = '<p style="color:red">Einsätze konnten nicht geladen werden.</p>';
  }
});

// 3)—Hilfsfunktion: alle shift-Karten bauen
function renderShifts(shifts) {
  shiftsContainer.innerHTML = shifts.map(s => `
    <div class="shift-card" data-shift-id="${s.id}">
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <p><strong>Zeit:</strong>
         ${new Date(s.start_time).toLocaleString()} – 
         ${new Date(s.end_time).toLocaleString()}
      </p>
      <p><strong>Erwartung:</strong> ${s.expectations}</p>
      <p class="spots">
        <em>${s.registrations.length} von ${s.max_helpers} Plätzen frei</em>
      </p>
      <button class="btn-signup">Anmelden</button>

      <!-- Das Formular liegt versteckt in jeder Karte -->
      <form class="signup-form" style="display:none; margin-top:1em;">
        <input type="hidden" name="shift_id" value="${s.id}">
        <div>
          <label>E-Mail:</label><br>
          <input type="email" name="email" required style="width:100%;">
        </div>
        <div style="margin-top:0.5em">
          <label>Name (optional):</label><br>
          <input type="text" name="name" style="width:100%;">
        </div>
        <button type="submit" style="margin-top:0.5em;">Absenden</button>
        <div class="msg" style="margin-top:0.5em;"></div>
      </form>
    </div>
  `).join('');

  // 4)—Eventhandler an Buttons und Formulare binden
  shiftsContainer.querySelectorAll('.shift-card').forEach(card => {
    const btn  = card.querySelector('.btn-signup');
    const form = card.querySelector('.signup-form');
    const msg  = card.querySelector('.msg');
    const spots= card.querySelector('.spots');

    // Formular ein-/ausklappen
    btn.addEventListener('click', () => {
      form.style.display = 'block';
      form.scrollIntoView({ behavior: 'smooth' });
    });

    // Formular-Submit
    form.addEventListener('submit', async ev => {
      ev.preventDefault();
      const fd = new FormData(form);
      const shift_id = +fd.get('shift_id');
      const email    = fd.get('email').trim();
      const name     = fd.get('name').trim() || null;

      try {
        // Registrierung speichern
        await registerHelper({ shift_id, email, name });

        // Erfolgsmeldung
        msg.style.color = 'green';
        msg.textContent = 'Danke! Dein Eintrag wurde gespeichert.';

        // Plätze neu holen & Anzeige updaten
        const updatedShifts = await fetchShifts(+eventSelect.value);
        const updated = updatedShifts.find(s => s.id === shift_id);
        spots.textContent = `${updated.registrations.length} von ${updated.max_helpers} Plätzen frei`;

        form.reset();
      } catch (err) {
        console.error('Fehler bei der Registrierung:', err);
        msg.style.color = 'red';
        msg.textContent = 'Fehler beim Speichern. Bitte später nochmal probieren.';
      }
    });
  });
}
