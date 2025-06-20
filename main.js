import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://eggzzfhqljmijnucnxnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8';
const supabase = createClient(supabaseUrl, supabaseKey);

// hole aktuell eingeloggten Benutzer
const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    location.reload();
});

const loadEventsWithAdminAccess = async (userId) => {
    const { data: accessList } = await supabase
        .from("admin_access")
        .select("event_id");

    const eventIds = accessList.map(a => a.event_id);

    const { data: events } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds);

    const container = document.getElementById("eventAccessContainer");
    events.forEach(event => {
        const card = document.createElement("div");
        card.style.border = "1px solid #ccc";
        card.style.margin = "10px";
        card.style.padding = "10px";
        card.innerHTML = `<strong>${event.title}</strong><br><small>${event.description}</small>`;
        container.appendChild(card);
    });
};

const init = async () => {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = "/auth";
        return;
    }

    document.getElementById("welcome").innerText = `Willkommen, ${user.email}`;
    loadEventsWithAdminAccess(user.id);
};

init();