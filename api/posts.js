let posts = []; // ذاكرة مؤقتة لحفظ البوستات على السيرفر

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // جلب البوستات
  if (req.method === 'GET') {
    return res.status(200).json(posts);
  }

  // إضافة بوست جديد
  if (req.method === 'POST') {
    const newPost = req.body;
    posts.unshift(newPost);
    return res.status(201).json({ success: true, post: newPost });
  }

  // حذف بوست
  if (req.method === 'DELETE') {
    const { id } = req.query;
    posts = posts.filter(p => p.id != id);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}