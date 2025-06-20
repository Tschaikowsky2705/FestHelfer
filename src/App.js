import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://eggzzfhqljmijnucnxnq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8"
);

export default function App() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      const { data, error } = await supabase.from("events").select("*");
      if (error) {
        console.error("Fehler beim Laden:", error.message);
        setError(error.message);
      } else {
        setEvents(data);
      }
    };
    loadEvents();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Testanzeige: Veranstaltungen</h1>
      {error && <p style={{ color: "red" }}>Fehler: {error}</p>}
      {events.length === 0 ? (
        <p>Keine Veranstaltungen gefunden.</p>
      ) : (
        <ul>
          {events.map((e) => (
            <li key={e.id}>
              {e.name} – {e.date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}