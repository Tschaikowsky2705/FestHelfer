// public/submit.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8';
const supabase    = createClient(supabaseUrl, supabaseKey);

/**
 * Lädt alle Veranstaltungen, sortiert nach Datum.
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
 * Lädt alle Einsätze (Shifts) für ein Event,
 * inkl. bereits registrierter Helfer zur Berechnung der freien Plätze.
 */
export async function fetchShifts(eventId) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*, registrations(id)')
    .eq('event_id', eventId)
    .order('title',      { ascending: true })
    .order('start_time', { ascending: true });
  if (error) throw error;
  return data.map(s => ({
    ...s,
    taken: s.registrations.length
  }));
}

/**
 * Registriert einen Helfer und schickt anschließend
 * eine interne Benachrichtigung an Uwe.
 *
 * @param {{ shift_id: number, email: string, name: string|null }} params
 */
export async function registerHelper({ shift_id, email, name }) {
  console.log('🔔 registerHelper called with:', { shift_id, email, name });

  // 1) Datensatz in registrations einfügen
  const { data: regData, error: regError } = await supabase
    .from('registrations')
    .insert([{ shift_id, email, name }]);
  if (regError) {
    console.error('❌ Supabase insert error:', regError);
    throw regError;
  }
  console.log('✅ Supabase insert success:', regData);

  // 2) Titel des gebuchten Shifts nachladen
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
  await fetch('/api/sendNotification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, shiftTitle })
  });

  return regData;
}
