import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8';  // ← hier deinen echten Anon-Key einsetzen
const supabase = createClient(supabaseUrl, supabaseKey);

/** 1) Alle Events laden */
export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return data;
}

/** 2) Alle Shifts zu einem Event laden */
export async function fetchShifts(eventId) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('event_id', eventId)
    .order('title', { ascending: true })       // zuerst nach Titel
    .order('start_time', { ascending: true }); // dann nach Uhrzeit
  if (error) throw error;
  return data;
}

/** 3) Anzahl Registrierungen für einen Shift ermitteln */
export async function fetchRegistrationCount(shiftId) {
  const { count, error } = await supabase
    .from('registrations')
    .select('id', { count: 'exact', head: true })
    .eq('shift_id', shiftId);
  if (error) throw error;
  return count;
}

/** 4) Helper anmelden, aber nur wenn noch Plätze frei sind */
export async function registerHelper({ shift_id, email, name }) {
  // erst max_helpers auslesen
  const { data: [shift], error: errShift } = await supabase
    .from('shifts')
    .select('max_helpers')
    .eq('id', shift_id)
    .limit(1);
  if (errShift) throw errShift;

  // dann aktuelle Anmeldungen zählen
  const currentCount = await fetchRegistrationCount(shift_id);
  if (currentCount >= shift.max_helpers) {
    throw new Error('Keine freien Plätze mehr in diesem Einsatz');
  }

  // einfügen
  const { error: errIns } = await supabase
    .from('registrations')
    .insert({ shift_id, email, name });
  if (errIns) throw errIns;
}
