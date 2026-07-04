let messages = []; // ذاكرة مؤقتة لحفظ الرسائل على السيرفر

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // جلب الرسائل
  if (req.method === 'GET') {
    const { user1, user2 } = req.query;
    if (user1 && user2) {
      const chatHistory = messages.filter(msg => 
        (msg.from === user1 && msg.to === user2) || (msg.from === user2 && msg.to === user1)
      );
      return res.status(200).json(chatHistory);
    }
    return res.status(200).json(messages);
  }

  // إرسال رسالة
  if (req.method === 'POST') {
    const { from, to, text } = req.body;
    if (!from || !to || !text) return res.status(400).json({ error: "بيانات ناقصة" });

    const newMessage = {
      id: Date.now(),
      from,
      to,
      text,
      timestamp: new Date().toLocaleTimeString('ar-SA')
    };
    messages.push(newMessage);
    return res.status(201).json({ success: true, message: newMessage });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}