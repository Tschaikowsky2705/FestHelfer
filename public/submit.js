// public/submit.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8';  // ← hier deinen echten Anon-Key einsetzen
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
 * inklusive bereits registrierter Helfer zur freien Platz-Berechnung.
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
    taken: s.registrations?.length ?? 0
  }));
}

/**
 * Registriert einen Helfer und verschickt eine Benachrichtigung an Uwe.
 * @param {{ shift_id: number, email: string, name: string|null }} params
 */
export async function registerHelper({ shift_id, email, name }) {
  // 1) In die Tabelle registrations eintragen
  const { error: insertError } = await supabase
    .from('registrations')
    .insert({ shift_id, email, name });
  if (insertError) throw insertError;

  // 2) Den Titel des gebuchten Einsatzes holen
  const { data: [shift], error: shiftError } = await supabase
    .from('shifts')
    .select('title')
    .eq('id', shift_id)
    .limit(1);
  if (shiftError) throw shiftError;

  // 3) Benachrichtigung an Uwe per Vercel-Serverless-Funktion
  await fetch('/api/sendNotification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      name,
      shiftTitle: shift?.title ?? '(unbekannt)'
    })
  });
}
