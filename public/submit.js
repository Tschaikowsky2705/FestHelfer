import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'DEIN_ANON_KEY_HIER';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchShifts(eventId) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('event_id', eventId)
    .order('start_time', { ascending: true });
  if (error) throw error;
  return data;
}
