// public/submit.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8'; // ← hier Deinen ANON-KEY einsetzen
const supabase    = createClient(supabaseUrl, supabaseKey);

/**
 * Lädt alle Veranstaltungen, sortiert nach Datum aufsteigend.
 * Liefert: [{ id, name, date, … }]
 */
export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });
  if (error) {
    console.error('❌ Supabase fetchEvents error', error);
    throw error;
  }
  return data;
}

/**
 * Lädt alle Einsätze (Shifts) zu einer Veranstaltung,
 * inklusive der Felder title, description, start_time, end_time und expectations.
 * Sortiert nach title (aufsteigend) und dann start_time (aufsteigend).
 *
 * @param {number} eventId
 * @returns {Promise<Array>}
 */
export async function fetchShifts(eventId) {
  const { data, error } = await supabase
    .from('shifts')
    .select('id, title, description, start_time, end_time, expectations')
    .eq('event_id', eventId)
    .order('title',      { ascending: true })
    .order('start_time', { ascending: true });
  if (error) {
    console.error('❌ Supabase fetchShifts error', error);
    throw error;
  }
  return data;
}
