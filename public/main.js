// public/main.js
import { fetchEvents, fetchShifts, registerHelper } from './submit.js';

const eventSelect     = document.getElementById('event-select');
const shiftsContainer = document.getElementById('shifts-container');

// 1) Events laden
async function loadEvents() {
  try {
    const events = await fetchEvents();
    eventSelect.innerHTML = [
      `<option value="">-- bitte wählen --</option>`,
      ...events.map(e =>
        `<option value="${e.id}">${e.name} (${e.date})</option>`
      )
    ].join('');
  } catch (err) {
    console.error(err);
    eventSelect.innerHTML = `<option value="">(Fehler beim Laden)</option>`;
  }
}

// 2) Bei Event-Auswahl: Shifts laden & rendern
eventSelect.addEventListener('change', async () => {
  const eventId = +eventSelect.value;
  if (!eventId) {
    shiftsContainer.innerHTML = `<p class="info">Bitte wähle eine Veranstaltung aus.</p>`;
    return;
  }
  shiftsContainer.innerHTML = ''; // reset
  try {
    const shifts = await fetchShifts(eventId);
    shiftsContainer.innerHTML = shifts.map(s => {
      const free = s.max_helpers - s.taken;
      return `
        <div class="shift-card" data-id="${s.id}">
          <h3>${s.title}</h3>
          <p>${s.description}</p>
          <p>
            <strong>Zeit:</strong>
            ${new Date(s.start_time).toLocaleString()} – 
            ${new Date(s.end_time).toLocaleString()}
          </p>
          <p><strong>Erwartung:</strong> ${s.expectations}</p>
          <p class="spots"><em>${free} von ${s.max_helpers} Plätzen frei</em></p>
          <button class="btn-signup" ${free<=0?'disabled':''}>
            ${free>0?'Anmelden':'Ausgebucht'}
          </button>
          <form class="signup-form">
            <input type="hidden" name="shift_id" value="${s.id}">
            <input type="email" name="email" placeholder="E-Mail" required>
            <input type="text" name="name" placeholder="Name (optional)">
            <button type="submit">Absenden</button>
            <div class="msg"></div>
          </form>
        </div>
      `;
    }).join('');

    // 3) Handler binden
    shiftsContainer.querySelectorAll('.shift-card').forEach(card => {
      const btn  = card.querySelector('.btn-signup');
      const form = card.querySelector('.signup-form');
      const msg  = card.querySelector('.msg');
      const spotsText = card.querySelector('.spots em') || card.querySelector('.spots');

      btn.addEventListener('click', () => {
        form.style.display = form.style.display === 'block' ? 'none' : 'block';
        form.scrollIntoView({ behavior:'smooth', block:'center' });
      });

      form.addEventListener('submit', async e => {
        e.preventDefault();
        const fd       = new FormData(form);
        const shift_id = +fd.get('shift_id');
        const email    = fd.get('email').trim();
        const name     = fd.get('name').trim() || null;
        try {
          await registerHelper({ shift_id, email, name });
          msg.style.color = 'green';
          msg.textContent = 'Danke! Anmeldung gespeichert.';
          form.reset();
          // Plätze aktualisieren
          const updated = await fetchShifts(eventId);
          const cur = updated.find(x => x.id === shift_id);
          const free = cur.max_helpers - cur.taken;
          card.querySelector('.spots').innerHTML = `<em>${free} von ${cur.max_helpers} Plätzen frei</em>`;
        } catch (err) {
          console.error(err);
          msg.style.color = 'red';
          msg.textContent = 'Fehler beim Speichern.';
        }
      });
    });

  } catch (err) {
    console.error(err);
    shiftsContainer.innerHTML = `<p class="info">(Fehler beim Laden der Einsätze)</p>`;
  }
});

// Initial
document.addEventListener('DOMContentLoaded', () => {
  loadEvents();
});
