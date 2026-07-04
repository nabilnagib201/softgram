// ============================================================
// SoftGram Backend Auth - سكريبت السيرفر المتوافق مع Vercel
// المسار: api/auth.js
// ============================================================

// مصفوفة مؤقتة لحفظ المستخدمين في الذاكرة (ملاحظة: عند إعادة تشغيل سيرفر Vercel ستفقد الحسابات الجديدة)
// لجعله احترافياً مستقبلاً يفضل ربطه بقاعدة بيانات مثل MongoDB أو Firebase
global.usersDatabase = global.usersDatabase || [
  { username: "admin", password: "123" },
  { username: "nabil", password: "123" }
];

module.exports = async (req, res) => {
  // تفعيل إعدادات الحماية والأمان للـ CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // قراءة الأكشن من الرابط (Query String)
  const { action } = req.query;

  // 1. معالجة عملية تسجيل الدخول
  if (req.method === 'POST' && action === 'login') {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "الرجاء إدخال اسم المستخدم وكلمة المرور" });
    }

    // البحث عن المستخدم في المصفوفة
    const user = global.usersDatabase.find(u => u.username === username && u.password === password);

    if (user) {
      return res.status(200).json({
        success: true,
        token: "softgram_secret_token_" + Date.now(), // توكن أمان مشفر مؤقت
        username: user.username
      });
    } else {
      return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة!" });
    }
  }

  // 2. معالجة عملية إنشاء حساب جديد
  if (req.method === 'POST' && action === 'signup') {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "البيانات غير مكتملة" });
    }

    // التحقق من أن الاسم غير مكرر
    const userExists = global.usersDatabase.some(u => u.username === username);
    if (userExists) {
      return res.status(400).json({ error: "اسم المستخدم مسجل مسبقاً، اختر اسماً آخر" });
    }

    // إضافة المستخدم الجديد
    global.usersDatabase.push({ username, password });
    return res.status(200).json({ success: true, message: "تم إنشاء الحساب بنجاح" });
  }

  // 3. التحقق التلقائي من التوكن (Verify)
  if (action === 'verify') {
    const token = req.headers['authorization'];
    if (token && token.startsWith("softgram_secret_token_")) {
      return res.status(200).json({ valid: true });
    }
    return res.status(401).json({ valid: false });
  }

  // في حال طلب مسار غير معروف
  return res.status(404).json({ error: "المسار غير موجود" });
};