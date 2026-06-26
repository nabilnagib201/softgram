// تحميل المستخدم الحالي
window.onload = function() {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    alert("مرحباً " + currentUser + " 🎉 أنت مسجل دخول بالفعل!");
    window.location.href = "index.html";
  }
};

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) return alert("أدخل اسم المستخدم وكلمة المرور!");

  const users = JSON.parse(localStorage.getItem("users")) || {};
  if (users[username] && users[username].password === password) {
    localStorage.setItem("currentUser", username);
    alert("✅ تسجيل الدخول ناجح!");
    window.location.href = "index.html";
  } else {
    alert("❌ اسم المستخدم أو كلمة المرور غير صحيحة!");
  }
}

function signup() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) return alert("أدخل اسم المستخدم وكلمة المرور!");

  let users = JSON.parse(localStorage.getItem("users")) || {};
  if (users[username]) {
    alert("⚠️ هذا الاسم مستخدم بالفعل!");
    return;
  }

  users[username] = { password, posts: [], messages: [] };
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", username);

  alert("🎉 تم إنشاء الحساب بنجاح!");
  window.location.href = "index.html";
}

function logout() {
  localStorage.removeItem("currentUser");
  alert("🚪 تم تسجيل الخروج بنجاح!");
  window.location.href = "login.html";
}
