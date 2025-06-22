
const veranstaltungen = [
    {
        id: 1,
        title: "Open-Air-Kino Frauenkappelen 22.08.2025"
    },
    {
        id: 2,
        title: "Open-Air-Kino Frauenkappelen 23.08.2025"
    }
];

const einsaetze = [
    {
        id: 1,
        eventId: 1,
        title: "Aufbau",
        description: "Infrastruktur aufbauen (Zelt, Tische, Technik)",
        expectations: "ca. 2 Stunden Zeit",
        start: "08:00",
        end: "10:00",
        max: 6
    },
    {
        id: 2,
        eventId: 1,
        title: "Aufbau – Teil 2",
        description: "Feinaufbau + letzte Vorbereitung",
        expectations: "1.5 Stunden Einsatz",
        start: "10:00",
        end: "12:30",
        max: 6
    },
    {
        id: 3,
        eventId: 2,
        title: "Kinokasse",
        description: "Gäste begrüßen, Tickets verkaufen",
        expectations: "Zuverlässigkeit & Freundlichkeit",
        start: "12:00",
        end: "13:00",
        max: 2
    }
];

const eventSelect = document.getElementById("eventSelect");
veranstaltungen.forEach(event => {
    const opt = document.createElement("option");
    opt.value = event.id;
    opt.textContent = event.title;
    eventSelect.appendChild(opt);
});

function zeigeEinsaetze() {
    const auswahl = parseInt(eventSelect.value);
    const container = document.getElementById("einsaetze");
    container.innerHTML = "";

    const gefiltert = einsaetze.filter(e => e.eventId === auswahl);
    if (gefiltert.length === 0) {
        container.innerHTML = "<p>Keine Einsätze für diese Veranstaltung gefunden.</p>";
        return;
    }

    gefiltert.forEach(einsatz => {
        const el = document.createElement("div");
        el.className = "einsatz";
        el.innerHTML = `
            <strong>${einsatz.title}</strong><br>
            <p>${einsatz.description}</p>
            <p><em>Erwartung:</em> ${einsatz.expectations}</p>
            <p><strong>Zeit:</strong> ${einsatz.start} – ${einsatz.end} Uhr</p>
            <p><strong>Max. Helfer:</strong> ${einsatz.max}</p>
        `;
        container.appendChild(el);
    });
}
