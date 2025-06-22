const SUPABASE_URL = 'https://eggzzfhqljmijfnucnxnq.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY_HERE';  // Ersetze durch deinen echten anon key

export async function fetchEvents() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/events?select=*`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  return await res.json();
}

export async function fetchShifts(eventId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/shifts?event_id=eq.\${eventId}`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  return await res.json();
}
