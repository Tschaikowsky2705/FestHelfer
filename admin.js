
function showSection(id) {
  document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

document.getElementById('shiftForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const res = await fetch('https://eggzzfhqljmijnucnxnq.supabase.co/rest/v1/shifts', {
    method: 'POST',
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      event_id: parseInt(data.event_id),
      title: data.title,
      description: data.description,
      expectations: data.expectations,
      start_time: new Date(data.start_time).toISOString(),
      end_time: new Date(data.end_time).toISOString(),
      max_helpers: parseInt(data.max_helpers)
    })
  });

  const result = document.getElementById('result');
  if (res.ok) {
    result.innerText = '✅ Einsatz gespeichert!';
    e.target.reset();
  } else {
    result.innerText = '❌ Fehler beim Speichern.';
  }
});
