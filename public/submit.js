// public/submit.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// 1) Supabase-Konfiguration – bitte Deinen Anon-Key einsetzen:
const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8';
const supabase    = createClient(supabaseUrl, supabaseKey);

/**
 * Lädt alle Veranstaltungen, sortiert nach Datum.
 * @returns {Promise<Array<{id:number, name:string, date:string}>>}
 */
export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('id, name, date')
    .order('date', { ascending: true });
  if (error) {
    console.error('fetchEvents error:', error);
    throw error;
  }
  return data;
}

/**
 * Lädt alle Einsätze (Shifts) für ein Event,
 * inklusive Beschreibung, Erwartung und Zeiten.
 * Sortiert zuerst alphabetisch nach Titel, dann chronologisch nach Startzeit.
 *
 * @param {number} eventId 
 * @returns {Promise<Array<{
 *   id: number,
 *   title: string,
 *   description: string,
 *   expectations: string,
 *   start_time: string,
 *   end_time: string
 * }>>}
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
      end_time
    `)
    .eq('event_id', eventId)
    .order('title',      { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('fetchShifts error:', error);
    throw error;
  }
  return data;
}
