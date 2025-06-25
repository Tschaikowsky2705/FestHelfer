import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'DEIN_ANON_KEY_HIER';  // unbedingt hier deinen echten anon-public-Key einsetzen
const supabase    = createClient(supabaseUrl, supabaseKey);

/** Veranstaltungen auslesen */
export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return data;
}

/** Einsätze (Shifts) für eine Veranstaltung auslesen */
export async function fetchShifts(eventId) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('event_id', eventId)
    // zuerst nach Titel sortieren, dann Zeit
    .order('title',      { ascending: true })
    .order('start_time', { ascending: true });
  if (error) throw error;
  return data;
}

/** Helper-Registrierung speichern */
export async function registerHelper({ shift_id, email, name }) {
  const { error } = await supabase
    .from('registrations')
    .insert({ shift_id, email, name });
  if (error) throw error;
}
