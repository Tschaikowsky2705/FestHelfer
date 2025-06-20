
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("error-msg");

  if (email === "uwe-baumann@gmx.ch" && password === "test1234") {
    window.location.href = "admin.html";
  } else {
    errorMsg.textContent = "Invalid login credentials";
  }
});
