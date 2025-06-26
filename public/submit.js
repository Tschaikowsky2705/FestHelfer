// public/submit.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8';  // ← hier Deinen Anon-Key einsetzen
const supabase    = createClient(supabaseUrl, supabaseKey);

/**
 * Alle Veranstaltungen laden.
 */
export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('id, name, date')
    .order('date', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Alle Einsätze (Shifts) für ein Event laden,
 * inkl. Beschreibung, Erwartung, Zeiten, max_helpers und aktuellen Registrierungen.
 */
export async function fetchShifts(eventId) {
  const { data, error } = await supabase
    .from('shifts')
    .select(`
      id,
      title,
      description,
      expectations,
      start_time,
      end_time,
      max_helpers,
      registrations(id)
    `)
    .eq('event_id', eventId)
    .order('title',      { ascending: true })
    .order('start_time', { ascending: true });
  if (error) throw error;
  // taken = Anzahl registrations
  return data.map(s => ({
    id:           s.id,
    title:        s.title,
    description:  s.description,
    expectations: s.expectations,
    start_time:   s.start_time,
    end_time:     s.end_time,
    max_helpers:  s.max_helpers,
    taken:        s.registrations.length
  }));
}

/**
 * Helfer in der DB eintragen.
 */
export async function registerHelper({ shift_id, email, name }) {
  const { error } = await supabase
    .from('registrations')
    .insert([{ shift_id, email, name }]);
  if (error) throw error;
}
