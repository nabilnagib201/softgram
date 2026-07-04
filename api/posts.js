// ============================================================
// SoftGram Posts API - معالجة البيانات والتفاعلات خلفياً
// المسار: api/posts.js
// ============================================================

global.postsDatabase = global.postsDatabase || [
  {
    id: "post_1",
    user: "admin",
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",
    caption: "التصميم الجديد الفخم لـ SoftGram 🌟",
    likes: [], 
    comments: [{ user: "nabil", text: "استايل رائع جداً!", timestamp: "الآن" }],
    sharesCount: 0,
    timestamp: "2026/7/4 18:30:15"
  }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, postId, id } = req.query;

  // 1. جلب المنشورات العامة
  if (req.method === 'GET' && !action) {
    return res.status(200).json(global.postsDatabase);
  }

  // 2. حذف منشور
  if (req.method === 'DELETE') {
    global.postsDatabase = global.postsDatabase.filter(p => p.id !== id);
    return res.status(200).json({ success: true });
  }

  // 3. معالجة عمليات التفاعل والرفع (POST)
  if (req.method === 'POST') {
    // رفع منشور جديد
    if (!action) {
      const newPost = req.body;
      global.postsDatabase.unshift(newPost);
      return res.status(200).json({ success: true });
    }

    const post = global.postsDatabase.find(p => p.id === postId);
    if (!post) return res.status(404).json({ error: "المنشور غير موجود" });

    const { currentUser } = req.body;

    // أ) الإعجابات
    if (action === 'like') {
      if (!post.likes) post.likes = [];
      const userIndex = post.likes.indexOf(currentUser);
      if (userIndex === -1) {
        post.likes.push(currentUser);
      } else {
        post.likes.splice(userIndex, 1);
      }
      return res.status(200).json({ success: true, likesCount: post.likes.length, isLiked: userIndex === -1 });
    }

    // ب) التعليقات
    if (action === 'comment') {
      const { text } = req.body;
      const newComment = { user: currentUser, text: text.trim(), timestamp: "الآن" };
      if (!post.comments) post.comments = [];
      post.comments.push(newComment);
      return res.status(200).json({ success: true, comments: post.comments });
    }

    // ج) المشاركة
    if (action === 'share') {
      post.sharesCount = (post.sharesCount || 0) + 1;
      return res.status(200).json({ success: true, sharesCount: post.sharesCount });
    }
  }

  return res.status(400).json({ error: "أمر غير صالح" });
};