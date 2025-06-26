import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8';  // ← hier wirklich deinen Anon-Key einsetzen
const supabase    = createClient(supabaseUrl, supabaseKey);

console.log('submit.js: Supabase-Client initialisiert');

export async function fetchEvents() {
  console.log('submit.js → fetchEvents()');
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });
  if (error) {
    console.error('submit.js → fetchEvents ERROR:', error);
    throw error;
  }
  console.log('submit.js → fetchEvents DATA:', data);
  return data;
}

export async function fetchShifts(eventId) {
  console.log('submit.js → fetchShifts(', eventId, ')');
  const { data, error } = await supabase
    .from('shifts')
    .select('*, registrations(id)')
    .eq('event_id', eventId)
    .order('title',      { ascending: true })
    .order('start_time', { ascending: true });
  if (error) {
    console.error('submit.js → fetchShifts ERROR:', error);
    throw error;
  }
  const mapped = data.map(s => ({
    ...s,
    taken: s.registrations?.length ?? 0
  }));
  console.log('submit.js → fetchShifts MAPPED:', mapped);
  return mapped;
}

export async function registerHelper({ shift_id, email, name }) {
  console.log('submit.js → registerHelper', { shift_id, email, name });
  // 1) Insert
  const { error: insertError } = await supabase
    .from('registrations')
    .insert({ shift_id, email, name });
  if (insertError) {
    console.error('submit.js → registerHelper INSERT ERROR:', insertError);
    throw insertError;
  }
  // 2) Shift-Titel holen
  const { data: [shift], error: shiftError } = await supabase
    .from('shifts')
    .select('title')
    .eq('id', shift_id)
    .limit(1);
  if (shiftError) {
    console.error('submit.js → registerHelper SHIFT FETCH ERROR:', shiftError);
    throw shiftError;
  }
  // 3) Benachrichtigung an Uwe
  try {
    const resp = await fetch('/api/sendNotification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name,
        shiftTitle: shift?.title ?? '(unbekannt)'
      })
    });
    console.log('submit.js → sendNotification response', resp.status);
  } catch (mailErr) {
    console.error('submit.js → sendNotification FAILED:', mailErr);
  }
}
