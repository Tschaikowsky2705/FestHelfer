import { useState } from "react";

const initialEvents = [
  {
    id: 1,
    name: "Sommerfest 2025",
    date: "2025-07-20",
    tasks: [],
  },
];

const ADMIN_PASSWORD = "admin123"; // Einfaches Passwort für Demo-Zwecke

export default function FestHelferApp() {
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState(initialEvents[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [joiningTaskId, setJoiningTaskId] = useState(null);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    time: "",
    maxHelpers: 6,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const handleJoin = (taskId) => {
    if (!name || !email) return;
    const updatedEvents = events.map((event) => {
      if (event.id !== selectedEvent.id) return event;
      return {
        ...event,
        tasks: event.tasks.map((task) => {
          if (task.id !== taskId) return task;
          if (task.helpers.length >= task.maxHelpers) return task;
          return {
            ...task,
            helpers: [...task.helpers, { name, email }],
          };
        }),
      };
    });
    setEvents(updatedEvents);
    setName("");
    setEmail("");
    setJoiningTaskId(null);
  };

  const handleAddEvent = () => {
    if (!newEventName || !newEventDate) return;
    const newEvent = {
      id: events.length + 1,
      name: newEventName,
      date: newEventDate,
      tasks: [],
    };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    setSelectedEvent(newEvent);
    setNewEventName("");
    setNewEventDate("");
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.time || !newTask.description) return;
    const updatedEvents = events.map((event) => {
      if (event.id !== selectedEvent.id) return event;
      return {
        ...event,
        tasks: [
          ...event.tasks,
          {
            ...newTask,
            id: event.tasks.length + 1,
            helpers: [],
          },
        ],
      };
    });
    setEvents(updatedEvents);
    setNewTask({ title: "", description: "", time: "", maxHelpers: 6 });
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setAdminPassword("");
    } else {
      alert("Falsches Passwort");
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
      <h1>FestHelfer</h1>

      {!isAdmin ? (
        <div>
          <h2>Admin-Login</h2>
          <input
            type="password"
            placeholder="Admin-Passwort"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />
          <button onClick={handleAdminLogin}>Einloggen</button>
        </div>
      ) : (
        <>
          <div>
            <h2>Neue Veranstaltung anlegen</h2>
            <input
              placeholder="Veranstaltungsname"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
            />
            <input
              type="date"
              value={newEventDate}
              onChange={(e) => setNewEventDate(e.target.value)}
            />
            <button onClick={handleAddEvent}>Veranstaltung hinzufügen</button>
          </div>

          <div>
            <h2>Neuen Einsatz hinzufügen</h2>
            <input
              placeholder="Titel"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <input
              placeholder="Beschreibung"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
            <input
              placeholder="Zeit (z.B. 10:00 - 12:00)"
              value={newTask.time}
              onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
            />
            <input
              type="number"
              min="1"
              value={newTask.maxHelpers}
              onChange={(e) =>
                setNewTask({ ...newTask, maxHelpers: parseInt(e.target.value) })
              }
            />
            <button onClick={handleAddTask}>Einsatz hinzufügen</button>
          </div>
        </>
      )}

      <div>
        <h2>Veranstaltung wählen</h2>
        <select
          value={selectedEvent.id}
          onChange={(e) => {
            const id = parseInt(e.target.value);
            const event = events.find((ev) => ev.id === id);
            if (event) setSelectedEvent(event);
          }}
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name} ({ev.date})
            </option>
          ))}
        </select>
      </div>

      <h2>{selectedEvent.name}</h2>
      <p>Datum: {selectedEvent.date}</p>

      {selectedEvent.tasks.map((task) => (
        <div key={task.id} style={{ border: "1px solid #ccc", padding: "1rem", margin: "1rem 0" }}>
          <h3>{task.title}</h3>
          <p>{task.time}</p>
          <p>{task.description}</p>
          <p>{task.helpers.length} / {task.maxHelpers} Helfer eingetragen</p>

          {joiningTaskId === task.id ? (
            <div>
              <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button onClick={() => handleJoin(task.id)}>Eintragen</button>
            </div>
          ) : task.helpers.length < task.maxHelpers ? (
            <button onClick={() => setJoiningTaskId(task.id)}>Ich helfe mit!</button>
          ) : (
            <p>Alle Helferplätze sind belegt</p>
          )}
        </div>
      ))}
    </div>
  );
}