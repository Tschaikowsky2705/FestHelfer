// public/submit.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8';
const supabase    = createClient(supabaseUrl, supabaseKey);

/**
 * Registriert einen Helfer und verschickt eine interne Benachrichtigung an Uwe.
 * @param {{ shift_id: number, email: string, name: string|null }} params
 * @returns {Promise<object[]>} das insert-Resultat
 */
export async function registerHelper({ shift_id, email, name }) {
  // 1) In Supabase speichern
  const { data: regData, error: regError } = await supabase
    .from('registrations')
    .insert([{ shift_id, email, name }]);
  if (regError) {
    console.error('❌ Supabase insert error:', regError);
    throw regError;
  }

  // 2) Shift-Titel holen
  const { data: shiftRows, error: shiftError } = await supabase
    .from('shifts')
    .select('title')
    .eq('id', shift_id)
    .limit(1);
  if (shiftError) {
    console.error('❌ Supabase fetch shift title error:', shiftError);
    throw shiftError;
  }
  const shiftTitle = shiftRows[0]?.title ?? '(unbekannt)';

  // 3) Interne Benachrichtigung an Uwe schicken
  const resp = await fetch('/api/sendNotification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, shiftTitle }),
  });
  if (!resp.ok) {
    console.warn('⚠️ Mailversand fehlgeschlagen');
    // wir werfen eine eigene Fehlermeldung, damit main.js sie abfangen kann:
    throw new Error('Mailversand fehlgeschlagen');
  }

  // 4) Rückgabe der gespeicherten Registrierung
  return regData;
}

/**
 * Alle Events holen
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
 * Alle Shifts eines Events plus Anzahl Registrierungen
 */
export async function fetchShifts(eventId) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*, registrations(id)')
    .eq('event_id', eventId)
    .order('title',      { ascending: true })
    .order('start_time', { ascending: true });
  if (error) throw error;
  // taken = Anzahl schon registrierter Helfer
  return data.map(s => ({ ...s, taken: s.registrations?.length || 0 }));
}
