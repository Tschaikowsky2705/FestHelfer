
const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
    const viewContainer = document.getElementById('view-container');
    const { data: events, error: eventError } = await supabase.from('events').select('*').order('date');
    if (eventError) {
        viewContainer.innerHTML = '<p>Error loading events.</p>';
        console.error(eventError);
        return;
    }

    const eventList = document.createElement('ul');
    events.forEach(event => {
        const li = document.createElement('li');
        li.textContent = `${event.name} (${event.date})`;
        li.addEventListener('click', () => loadShifts(event.id));
        eventList.appendChild(li);
    });
    viewContainer.appendChild(eventList);
});

async function loadShifts(eventId) {
    const viewContainer = document.getElementById('view-container');
    viewContainer.innerHTML = `<h2>Shifts for Event ID ${eventId}</h2>`;
    const { data: shifts, error: shiftError } = await supabase.from('shifts').select('*').eq('event_id', eventId).order('start_time');
    if (shiftError) {
        viewContainer.innerHTML += '<p>Error loading shifts.</p>';
        console.error(shiftError);
        return;
    }

    const shiftList = document.createElement('ul');
    shifts.forEach(shift => {
        const li = document.createElement('li');
        li.textContent = `${shift.title}: ${shift.start_time}–${shift.end_time} (${shift.max_helpers} helpers)`;
        shiftList.appendChild(li);
    });
    viewContainer.appendChild(shiftList);
}
