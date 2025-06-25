import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8';  // ← ersetze durch deinen echten anon-public Key
const supabase    = createClient(supabaseUrl, supabaseKey);

/**
 * Lädt alle Events, sortiert nach Datum.
 */
export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Lädt alle Shifts eines Events inkl. aller Registrierungen,
 * berechnet daraus die Anzahl bereits belegter Plätze (taken).
 */
export async function fetchShifts(eventId) {
  const { data, error } = await supabase
    .from('shifts')
    .select(`
      *,
      registrations(id)
    `)
    .eq('event_id', eventId)
    .order('title',      { ascending: true })
    .order('start_time', { ascending: true });
  if (error) throw error;

  // Mappe registrations.length → taken
  return data.map(s => ({
    ...s,
    taken: s.registrations?.length ?? 0
  }));
}

/**
 * Speichert eine Anmeldung in registrations.
 * Deine RLS-Policy verhindert Überbuchung bereits serverseitig.
 */
export async function registerHelper({ shift_id, email, name }) {
  const { error } = await supabase
    .from('registrations')
    .insert({ shift_id, email, name });
  if (error) throw error;
}
