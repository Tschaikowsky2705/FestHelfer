import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8';  
const supabase    = createClient(supabaseUrl, supabaseKey);

/**
 * Lädt alle Events, sortiert aufsteigend nach Datum.
 * @returns {Promise<Array>} Liste der Events
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
 * Lädt alle Shifts zu einem Event, sortiert
 * 1. alphabetisch nach title
 * 2. chronologisch nach start_time
 * @param {number} eventId 
 * @returns {Promise<Array>} Liste der Shifts
 */
export async function fetchShifts(eventId) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('event_id', eventId)
    .order('title',      { ascending: true })   // zuerst nach Titel
    .order('start_time', { ascending: true });  // dann nach Startzeit

  if (error) throw error;
  return data;
}
