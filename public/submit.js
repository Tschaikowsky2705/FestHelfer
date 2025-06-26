// public/submit.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

console.log('submit.js geladen');

const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8';  // ← bitte hier deinen tatsächlichen Anon-Key einsetzen
const supabase    = createClient(supabaseUrl, supabaseKey);

console.log('Supabase-Client initialisiert:', supabaseUrl);

/**
 * Alle Veranstaltungen laden.
 */
export async function fetchEvents() {
  console.log('fetchEvents() aufgerufen');
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('fetchEvents ERROR:', error);
    throw error;
  }
  console.log('fetchEvents DATA:', data);
  return data;
}

/**
 * Alle Einsätze (Shifts) für ein Event laden.
 */
export async function fetchShifts(eventId) {
  console.log('fetchShifts(', eventId, ')');
  const { data, error } = await supabase
    .from('shifts')
    .select('*, registrations(id), max_helpers')
    .eq('event_id', eventId)
    .order('title',      { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('fetchShifts ERROR:', error);
    throw error;
  }
  // taken = registrierungen.length
  const mapped = data.map(s => ({
    ...s,
    taken: s.registrations.length
  }));
  console.log('fetchShifts MAPPED:', mapped);
  return mapped;
}

/**
 * Helfer in der DB eintragen.
 */
export async function registerHelper({ shift_id, email, name }) {
  console.log('registerHelper called mit:', { shift_id, email, name });
  const { data, error } = await supabase
    .from('registrations')
    .insert([{ shift_id, email, name }]);

  if (error) {
    console.error('registerHelper ERROR:', error);
    throw error;
  }
  console.log('registerHelper SUCCESS:', data);
  return data;
}
