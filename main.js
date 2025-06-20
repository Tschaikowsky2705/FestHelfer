
// Beispielhafte JS-Datei zum Abruf und Anzeigen von Einsätzen
document.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch("/api/shifts"); // Platzhalter-URL
    const data = await res.json();
    const container = document.getElementById("events-container");

    container.innerHTML = data.map(event => `
        <h2>${event.name} (${event.date})</h2>
        <ul>
            ${event.shifts.map(shift => `
                <li>
                    <strong>${shift.title}</strong><br>
                    ${shift.description}<br>
                    Erwartung: ${shift.expectations}<br>
                    Zeit: ${shift.start_time} – ${shift.end_time}<br>
                    Max. Helfer: ${shift.max_helpers}
                </li>
            `).join("")}
        </ul>
    `).join("");
});
