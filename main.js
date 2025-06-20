import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://eggzzfhqljmijnucnxnq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3p6ZmhxbGptaWpudWNueG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ4ODgsImV4cCI6MjA2NjAyMDg4OH0.fCOh-A_Z6MzUqmCyE7TL-lT1ApP6hAWi9SHzX_0POC8";
const supabase = createClient(supabaseUrl, supabaseKey);

const userEmailSpan = document.getElementById("user-email");
const eventsDiv = document.getElementById("events");

load();

async function load() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = "/admin.html";
    return;
  }

  userEmailSpan.textContent = user.email;

  const { data: events } = await supabase.from("events").select("*").order("start_date");

  for (const event of events) {
    const isAdmin = true;

    const eventBox = document.createElement("div");
    eventBox.style.border = "1px solid #ccc";
    eventBox.style.padding = "10px";
    eventBox.style.marginBottom = "10px";

    const title = document.createElement("strong");
    title.textContent = `${event.title} ${formatDate(event.start_date)}`;
    eventBox.appendChild(title);

    if (!isAdmin) {
      const msg = document.createElement("p");
      msg.textContent = "Nur du bist als Admin eingetragen";
      eventBox.appendChild(msg);
    } else {
      const { data: shifts } = await supabase
        .from("shifts")
        .select("*")
        .eq("event_id", event.id)
        .order("start_time");

      const shiftList = document.createElement("ul");

      for (const shift of shifts) {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${shift.title}</strong>: ${shift.description} <br/>
        <em>Erwartungen:</em> ${shift.expectations}<br/>
        ⏰ ${formatTime(shift.start_time)} – ${formatTime(shift.end_time)}, max. ${shift.max_helpers} Helfer`;
        shiftList.appendChild(li);
      }

      if (shifts.length === 0) {
        const li = document.createElement("li");
        li.textContent = "Noch keine Einsätze geplant.";
        shiftList.appendChild(li);
      }

      eventBox.appendChild(shiftList);
    }

    eventsDiv.appendChild(eventBox);
  }
}

function logout() {
  supabase.auth.signOut().then(() => {
    window.location.href = "/admin.html";
  });
}

function inviteAdmin() {
  const email = document.getElementById("invite-email").value;
  alert("Einladen noch nicht implementiert: " + email);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("de-CH");
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
}
