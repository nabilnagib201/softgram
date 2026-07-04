// تحقق أمني عند تحميل الصفحة لمنع الدخول العشوائي
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem("authToken");
  
  // إذا كان المستخدم في صفحة الدخول ومعه توكن صالح، ينقل للرئيسية تلقائياً
  if (token && window.location.pathname.includes("login.html")) {
    fetch('/api/auth?action=verify', {
      headers: { 'Authorization': token }
    })
    .then(res => res.json())
    .then(data => {
      if (data.valid) window.location.href = "index.html";
    });
  }
});

// دالة تسجيل الدخول الآمن
function login() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password"); // تأكد من وجود حقل الباسورد في الـ HTML

  const username = usernameInput ? usernameInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value.trim() : "";

  if (!username || !password) return alert("أدخل اسم المستخدم وكلمة المرور!");

  fetch('/api/auth?action=login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert(data.error);
    } else if (data.success) {
      // حفظ توكن الأمان واسم المستخدم
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("currentUser", data.username);
      alert("✅ تم تسجيل الدخول بأمان!");
      window.location.href = "index.html";
    }
  })
  .catch(err => alert("حدث خطأ في الاتصال بسيرفر الأمان"));
}

// دالة إنشاء حساب جديد آمن
function signup() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) return alert("أدخل اسم المستخدم وكلمة المرور لإنشاء الحساب!");

  fetch('/api/auth?action=signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert(data.error);
    } else {
      alert("🎉 تم إنشاء حسابك الآمن بنجاح! يمكنك تسجيل الدخول الآن.");
    }
  });
}

// تسجيل الخروج وتدمير التوكن
function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}