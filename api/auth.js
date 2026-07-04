// ذاكرة مؤقتة لحفظ المستخدمين المسجلين على السيرفر
let users = {}; 
// ذاكرة للرموز النشطة (Sessions) لمنع التزوير
let activeTokens = {}; 

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 1. تسجيل حساب جديد (Signup)
  if (req.method === 'POST' && req.query.action === 'signup') {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "بيانات ناقصة" });
    
    if (users[username]) {
      return res.status(400).json({ error: "⚠️ اسم المستخدم هذا مسجل بالفعل!" });
    }

    // حفظ المستخدم (في تطبيق حقيقي يتم تشفير كلمة المرور هنا بـ bcrypt)
    users[username] = { password }; 
    return res.status(201).json({ success: true, message: "تم إنشاء الحساب بنجاح" });
  }

  // 2. تسجيل الدخول والتحقق (Login)
  if (req.method === 'POST' && req.query.action === 'login') {
    const { username, password } = req.body;
    
    if (!users[username] || users[username].password !== password) {
      return res.status(401).json({ error: "❌ اسم المستخدم أو كلمة المرور غير صحيحة!" });
    }

    // توليد رمز أمان فريد (Secure Token) للجلسة لتعريف المستخدم
    const secureToken = 'token_' + Math.random().toString(36).substr(2) + Date.now();
    activeTokens[secureToken] = username;

    return res.status(200).json({ 
      success: true, 
      token: secureToken, 
      username: username 
    });
  }

  // 3. التحقق من حماية الجلسة (Verify Session)
  if (req.method === 'GET' && req.query.action === 'verify') {
    const token = req.headers.authorization;
    if (token && activeTokens[token]) {
      return res.status(200).json({ valid: true, username: activeTokens[token] });
    }
    return res.status(401).json({ valid: false, error: "جلسة غير صالحة أو منتهية" });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}