
const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8';

const client = supabase.createClient(supabaseUrl, supabaseKey);

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
        document.getElementById("login-error").innerText = "Login fehlgeschlagen.";
    } else {
        loadAdminView();
    }
}

async function logout() {
    await client.auth.signOut();
    document.getElementById("login-view").style.display = "block";
    document.getElementById("admin-view").style.display = "none";
}

async function loadAdminView() {
    const { data: session } = await client.auth.getSession();
    const user = session?.session?.user;
    if (!user) return;

    document.getElementById("login-view").style.display = "none";
    document.getElementById("admin-view").style.display = "block";
    document.getElementById("welcome").innerText = `Willkommen, ${user.email}`;

    const { data: access } = await client.from("admin_access").select("event_id");
    const ids = access.map(a => a.event_id);
    const { data: events } = await client.from("events").select("*").in("id", ids);

    const container = document.getElementById("events");
    container.innerHTML = "";
    for (const event of events) {
        const box = document.createElement("div");
        box.style.border = "1px solid #ccc";
        box.style.margin = "10px";
        box.style.padding = "10px";
        box.innerHTML = `<strong>${event.name} ${new Date(event.date).toLocaleDateString()}</strong><div id="shifts-${event.id}">Lade Einsätze...</div>`;
        container.appendChild(box);
        loadShifts(event.id);
    }
}

async function loadShifts(eventId) {
    const { data: shifts } = await client.from("shifts").select("*").eq("event_id", eventId);
    const div = document.getElementById(`shifts-${eventId}`);
    if (!shifts || shifts.length === 0) {
        div.innerText = "Keine Einsätze gefunden.";
        return;
    }
    div.innerHTML = "";
    for (const shift of shifts) {
        const el = document.createElement("div");
        el.innerHTML = `
            <strong>${shift.title}</strong><br>
            ${shift.description}<br>
            <em>${shift.expectations}</em><br>
            ${new Date(shift.start_time).toLocaleTimeString()} - ${new Date(shift.end_time).toLocaleTimeString()} Uhr<br>
            Max. Helfer: ${shift.max_helpers}<br><br>`;
        div.appendChild(el);
    }
}

loadAdminView();
