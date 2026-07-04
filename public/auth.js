function login() {
  const username = document.getElementById("username").value.trim();
  if (!username) return alert("أدخل اسم المستخدم!");
  localStorage.setItem("currentUser", username);
  alert("✅ تم تسجيل الدخول بنجاح!");
  window.location.href = "index.html";
}
function signup() { login(); }
function logout() { localStorage.removeItem("currentUser"); window.location.href = "login.html"; }