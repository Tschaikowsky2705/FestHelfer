import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://eggzzfhqljmijnucnxnq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function FestHelferApp() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [events, setEvents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [accessMap, setAccessMap] = useState({});

  const login = async () => {
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pw,
    });
    if (error) {
      setError(error.message);
    } else {
      setUser(data.user);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEmail("");
    setPw("");
  };

  const inviteAdmin = async () => {
    const { error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail);
    if (error) {
      alert("Fehler: " + error.message);
    } else {
      alert("Einladung an " + inviteEmail + " gesendet.");
      setInviteEmail("");
    }
  };

  const fetchAdmins = async () => {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (!error) {
      setAdmins(data.users);
    }
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase.from("events").select("*");
    if (!error) {
      setEvents(data);
    }
  };

  const fetchAccess = async () => {
    const { data, error } = await supabase.from("admin_access").select("*");
    if (!error) {
      const map = {};
      data.forEach((entry) => {
        if (!map[entry.event_id]) map[entry.event_id] = [];
        map[entry.event_id].push(entry.admin_email);
      });
      setAccessMap(map);
    }
  };

  const updateAccess = async (eventId, email, hasAccess) => {
    if (hasAccess) {
      await supabase.from("admin_access").insert({ event_id: eventId, admin_email: email });
    } else {
      await supabase
        .from("admin_access")
        .delete()
        .eq("event_id", eventId)
        .eq("admin_email", email);
    }
    fetchAccess();
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchAdmins();
      fetchAccess();
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{ maxWidth: 400, margin: "2rem auto" }}>
        <h2>Admin Login</h2>
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <button onClick={login}>Einloggen</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h2>Willkommen, {user.email}</h2>
      <button onClick={logout}>Abmelden</button>

      <h3>📩 Admin einladen</h3>
      <input
        type="email"
        placeholder="E-Mail-Adresse eingeben"
        value={inviteEmail}
        onChange={(e) => setInviteEmail(e.target.value)}
      />
      <button onClick={inviteAdmin}>Einladen</button>

      <h3>🎯 Admin-Zugriff pro Veranstaltung</h3>
      {events.map((event) => (
        <div key={event.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <strong>{event.name}</strong>
          {admins.length === 0 ? (
            <p>Nur du bist als Admin eingetragen</p>
          ) : (
            admins.map((admin) => {
              const isChecked =
                accessMap[event.id] && accessMap[event.id].includes(admin.email);
              return (
                <div key={admin.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        updateAccess(event.id, admin.email, e.target.checked)
                      }
                    />{" "}
                    {admin.email}
                  </label>
                </div>
              );
            })
          )}
        </div>
      ))}
    </div>
  );
}