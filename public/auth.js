// ============================================================
// SoftGram Frontend Auth - سكريبت المتصفح والواجهة
// المسار: public/auth.js
// ============================================================

// التحقق التلقائي عند دخول الصفحة
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem("authToken");
  const currentPath = window.location.pathname;

  if (token && currentPath.includes("login.html")) {
    fetch('/api/auth?action=verify', {
      headers: { 'Authorization': token }
    })
    .then(res => res.json())
    .then(data => {
      if (data.valid) window.location.href = "index.html";
    })
    .catch(() => console.log("التوكن منتهي أو غير صالح"));
  }

  // حماية الصفحات الداخلية: إذا حاول شخص دخول الرئيسية بدون تسجيل دخول ينقله فوراً
  if (!token && (currentPath.includes("index.html") || currentPath === "/")) {
    window.location.href = "login.html";
  }
});

// دالة تسجيل الدخول
function login() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  if (!usernameInput || !passwordInput) return;

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) return alert("الرجاء كتابة اسم المستخدم وكلمة المرور!");

  fetch('/api/auth?action=login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(res => {
    if (!res.ok) {
      // قراءة رسالة الخطأ القادمة من السيرفر وعرضها
      return res.json().then(err => { throw new Error(err.error || "فشل تسجيل الدخول") });
    }
    return res.json();
  })
  .then(data => {
    if (data.success) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("currentUser", data.username);
      alert("✅ تم تسجيل الدخول بنجاح!");
      window.location.href = "index.html";
    }
  })
  .catch(err => alert(err.message));
}

// دالة إنشاء الحساب
function signup() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) return alert("أدخل البيانات أولاً!");

  fetch('/api/auth?action=signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(res => {
    return res.json().then(data => {
      if (!res.ok) throw new Error(data.error || "فشل إنشاء الحساب");
      return data;
    });
  })
  .then(data => {
    if (data.success) {
      alert("🎉 تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
    }
  })
  .catch(err => alert(err.message));
}