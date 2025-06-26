// public/main.js

import { fetchEvents, fetchShifts, registerHelper } from './submit.js';

//
// ─── 1) DOM-Elemente holen ───────────────────────────────────────────────────────
//
const eventSelect      = document.getElementById('event-select');
const shiftsContainer  = document.getElementById('shifts-container');
const regContainer     = document.getElementById('registration-container');
const regShiftSelect   = document.getElementById('reg-shift');
const regEmailInput    = document.getElementById('reg-email');
const regNameInput     = document.getElementById('reg-name');
const regForm          = document.getElementById('reg-form');
const regMsg           = document.getElementById('reg-msg');

//
// ─── 2) Events laden mit Error-Handling ─────────────────────────────────────────
//
async function loadEvents() {
  try {
    console.log('▶️ loadEvents() gestartet');
    const events = await fetchEvents();
    console.log('✅ Events erhalten:', events);
    // Dropdown zurücksetzen
    eventSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
    // Optionen anfügen
    events.forEach(e => {
      const opt = document.createElement('option');
      opt.value       = e.id;
      opt.textContent = `${e.name} (${e.date})`;
      eventSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('❌ Fehler in loadEvents():', err);
    eventSelect.innerHTML = '<option value="">(Fehler beim Laden)</option>';
  }
}

loadEvents();

//
// ─── 3) Auf Event-Wechsel reagieren ──────────────────────────────────────────────
//
eventSelect.addEventListener('change', async e => {
  const eventId = Number(e.target.value);
  clearShifts();
  clearRegistration();

  if (!eventId) {
    // kein Event gewählt → nichts weiter tun
    return;
  }

  try {
    // 3.1) Shifts holen
    const shifts = await fetchShifts(eventId);
    console.log(`✅ Shifts für Event ${eventId}:`, shifts);

    // 3.2) Shifts rendern
    renderShifts(shifts);

    // 3.3) Registrierung einrichten
    setupRegistration(shifts);
  } catch (err) {
    console.error('❌ Fehler beim Laden der Shifts:', err);
    shiftsContainer.innerHTML = '<p style="color: red;">Fehler beim Laden der Einsätze.</p>';
  }
});

//
// ─── 4) Hilfsfunktionen zum Aufräumen und Darstellen ─────────────────────────────
//
function clearShifts() {
  shiftsContainer.innerHTML = '';
}

function renderShifts(shifts) {
  shiftsContainer.innerHTML = shifts.map(s => `
    <div class="shift-card" data-shift-id="${s.id}">
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <p><strong>Zeit:</strong>
         ${new Date(s.start_time).toLocaleString()} – 
         ${new Date(s.end_time).toLocaleString()}</p>
      <p><strong>Plätze frei:</strong> ${s.max_helpers - (s.taken||0)} von ${s.max_helpers}</p>
      <button class="select-shift-btn">Anmelden</button>
    </div>
  `).join('');

  // Shift-Buttons aktivieren
  document.querySelectorAll('.select-shift-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.shift-card');
      const shiftId = card.dataset.shiftId;
      // Vorauswahl im Registrierungs-Dropdown
      regShiftSelect.value = shiftId;
      // Formular anzeigen
      regContainer.style.display = 'block';
      // Ansicht scrollt zum Formular
      regContainer.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function clearRegistration() {
  // Formular verbergen und Felder zurücksetzen
  regContainer.style.display = 'none';
  regShiftSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
  regEmailInput.value = '';
  regNameInput.value  = '';
  regMsg.textContent  = '';
}

function setupRegistration(shifts) {
  // Multi-Select nur einmal befüllen
  regShiftSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
  shifts.forEach(s => {
    const opt = document.createElement('option');
    opt.value       = s.id;
    opt.textContent = `${s.title} (${new Date(s.start_time).toLocaleTimeString()})`;
    regShiftSelect.appendChild(opt);
  });
  // Formular anzeigen
  regContainer.style.display = 'block';
}

//
// ─── 5) Formular-Submit: Helper eintragen + Bestätigung an Uwe ─────────────────
//
regForm.addEventListener('submit', async e => {
  e.preventDefault();
  const shift_id = Number(regShiftSelect.value);
  const email    = regEmailInput.value.trim();
  const name     = regNameInput.value.trim() || null;

  if (!shift_id || !email) {
    regMsg.style.color = 'red';
    regMsg.textContent = 'Bitte Einsatz und E-Mail ausfüllen.';
    return;
  }

  try {
    console.log('▶️ registerHelper aufgerufen mit:', { shift_id, email, name });

    // 5.1) In DB eintragen
    await registerHelper({ shift_id, email, name });

    // 5.2) Erfolgsmeldung
    regMsg.style.color   = 'green';
    regMsg.textContent   = 'Danke, deine Anmeldung wurde gespeichert!';

    // 5.3) Formular zurücksetzen und Shifts neu laden (um Plätze zu aktualisieren)
    regForm.reset();
    eventSelect.dispatchEvent(new Event('change'));
  } catch (err) {
    console.error('❌ Fehler bei registerHelper():', err);
    regMsg.style.color   = err.message === 'Mailversand fehlgeschlagen' ? 'orange' : 'red';
    regMsg.textContent   = err.message === 'Mailversand fehlgeschlagen'
      ? 'Anmeldung gespeichert, E-Mail konnte nicht gesendet werden.'
      : 'Fehler bei der Anmeldung.';
  }
});
