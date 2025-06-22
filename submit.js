// submit.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#einsatzForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { createClient } = supabase;
    const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const data = {
      title: form.title.value,
      description: form.description.value,
      expectations: form.expectations.value,
      start_time: form.start_time.value,
      event_id: form.event_id.value
    };

    const { error } = await supa.from('shifts').insert([data]);
    if (error) {
      alert('Fehler beim Speichern: ' + error.message);
    } else {
      alert('Einsatz erfolgreich gespeichert!');
      form.reset();
    }
  });
});