const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8';

const client = supabase.createClient(supabaseUrl, supabaseKey);

const eventSelect = document.getElementById('eventSelect');
const shiftsContainer = document.getElementById('shiftsContainer');

async function loadEvents() {
    const { data: events } = await client.from('events').select('*').order('date');
    eventSelect.innerHTML = events.map(e =>
        `<option value="${e.id}">${e.title} (${new Date(e.date).toLocaleDateString()})</option>`
    ).join('');
    loadShifts(events[0]?.id);
}

eventSelect.addEventListener('change', () => {
    loadShifts(eventSelect.value);
});

async function loadShifts(eventId) {
    const { data: shifts } = await client.from('shifts').select('*').eq('event_id', eventId).order('start_time');
    shiftsContainer.innerHTML = shifts.map(s => `
        <div>
            <strong>${s.title}</strong><br>
            ${s.description}<br>
            <em>${s.expectations}</em><br>
            Zeit: ${new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            – ${new Date(s.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}<br>
            Max. Helfer: ${s.max_helpers}
            <hr>
        </div>
    `).join('');
}

loadEvents();
