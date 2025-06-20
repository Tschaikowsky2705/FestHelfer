import { useState } from "react";

const initialEvents = [
  {
    id: 1,
    name: "Sommerfest 2025",
    date: "2025-07-20",
    tasks: [
      {
        id: 1,
        title: "Getränkestand",
        description: "Ausgabe von Getränken",
        time: "14:00 - 17:00",
        maxHelpers: 6,
        helpers: [],
      },
      {
        id: 2,
        title: "Aufbau Bühne",
        description: "Hilfe beim Aufbau der Bühne",
        time: "09:00 - 11:00",
        maxHelpers: 3,
        helpers: [],
      },
    ],
  },
];

export default function FestHelferApp() {
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState(events[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [joiningTaskId, setJoiningTaskId] = useState(null);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");

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

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
      <h1>FestHelfer</h1>

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