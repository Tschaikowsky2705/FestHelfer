import { fetchEvents, fetchShifts } from './submit.js';

const app = document.getElementById('app');

async function render() {
  const events = await fetchEvents();
  if (!events.length) {
    app.innerHTML = '<p>No events found.</p>';
    return;
  }

  const select = document.createElement('select');
  select.innerHTML = events.map(e => 
    `<option value="\${e.id}">\${e.name} (\${e.date})</option>`).join('');
  select.addEventListener('change', async (e) => {
    await renderShifts(e.target.value);
  });

  app.innerHTML = '<h1>Choose Event</h1>';
  app.appendChild(select);
  await renderShifts(events[0].id);
}

async function renderShifts(eventId) {
  const shifts = await fetchShifts(eventId);
  const list = document.createElement('div');
  list.innerHTML = shifts.map(s => `
    <div style="margin-bottom: 1em;">
      <strong>\${s.title}</strong><br/>
      \${s.description}<br/>
      Start: \${new Date(s.start_time).toLocaleString()}<br/>
      Erwartung: \${s.expectation}
    </div>
  `).join('');
  const oldList = document.querySelector('#shift-list');
  if (oldList) oldList.remove();
  list.id = 'shift-list';
  app.appendChild(list);
}

render();
