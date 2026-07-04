// ============================================================
// SoftGram Advanced Features - نسخة السيرفر المتوافقة مع Vercel
// ============================================================

// 1. نظام البحث المتقدم (Advanced Search System)
class SearchEngine {
  constructor() {
    this.history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  }

  async search(query) {
    try {
      const res = await fetch('/api/posts');
      const allPosts = await res.json();
      const results = allPosts.filter(post =>
        post.user.includes(query) || (post.comments && post.comments.some(c => c.text.includes(query)))
      );
      this.addToHistory(query);
      return results;
    } catch (err) {
      console.error("خطأ أثناء البحث السيرفر:", err);
      return [];
    }
  }

  addToHistory(query) {
    if (!this.history.includes(query)) {
      this.history.unshift(query);
      if (this.history.length > 20) this.history.pop();
      localStorage.setItem("searchHistory", JSON.stringify(this.history));
    }
  }

  getHistory() { return this.history; }
  clearHistory() {
    this.history = [];
    localStorage.setItem("searchHistory", JSON.stringify(this.history));
  }
}

// 2. نظام المتابعة (Follow System)
class FollowSystem {
  constructor() {
    this.followers = JSON.parse(localStorage.getItem("followers")) || {};
    this.following = JSON.parse(localStorage.getItem("following")) || {};
  }

  follow(username) {
    const currentUser = localStorage.getItem("currentUser") || "ضيف";
    if (currentUser === username) return alert("لا يمكنك متابعة نفسك!");

    if (!this.following[currentUser]) this.following[currentUser] = [];
    if (!this.followers[username]) this.followers[username] = [];

    if (!this.following[currentUser].includes(username)) {
      this.following[currentUser].push(username);
      this.followers[username].push(currentUser);
      this.save();
      
      // إرسال إشعار للمستخدم المستهدف
      notificationSystem.addNotification(username, `قام @${currentUser} بمتابعتك الآن!`);
    }
  }

  unfollow(username) {
    const currentUser = localStorage.getItem("currentUser") || "ضيف";
    if (this.following[currentUser]) {
      this.following[currentUser] = this.following[currentUser].filter(u => u !== username);
    }
    if (this.followers[username]) {
      this.followers[username] = this.followers[username].filter(u => u !== currentUser);
    }
    this.save();
  }

  save() {
    localStorage.setItem("followers", JSON.stringify(this.followers));
    localStorage.setItem("following", JSON.stringify(this.following));
  }
}

// 3. نظام الإشعارات (Notification System)
class NotificationSystem {
  constructor() {
    this.notifications = JSON.parse(localStorage.getItem("notifications")) || {};
  }

  addNotification(username, text) {
    if (!this.notifications[username]) this.notifications[username] = [];
    this.notifications[username].unshift({
      id: Date.now(),
      text,
      read: false,
      timestamp: new Date().toLocaleTimeString('ar-SA')
    });
    localStorage.setItem("notifications", JSON.stringify(this.notifications));
  }

  getUnreadCount(username) {
    const userNotifs = this.notifications[username] || [];
    return userNotifs.filter(n => !n.read).length;
  }

  markAsRead(username) {
    if (this.notifications[username]) {
      this.notifications[username].forEach(n => n.read = true);
      localStorage.setItem("notifications", JSON.stringify(this.notifications));
    }
  }
}

// 4. نظام الهاشتاغات (Hashtag System)
class HashtagSystem {
  constructor() {
    this.tags = JSON.parse(localStorage.getItem("hashtags")) || {};
  }

  indexPost(postId, text) {
    const matches = text.match(/#[\wأ-ي]+/g);
    if (matches) {
      matches.forEach(tag => {
        if (!this.tags[tag]) this.tags[tag] = [];
        if (!this.tags[tag].includes(postId)) {
          this.tags[tag].push(postId);
        }
      });
      localStorage.setItem("hashtags", JSON.stringify(this.tags));
    }
  }

  getTrendingTags(limit = 5) {
    return Object.keys(this.tags)
      .map(tag => ({ tag, count: this.tags[tag].length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

// 5. نظام الإحصائيات (Statistics System)
class StatisticsSystem {
  async getStats() {
    try {
      const res = await fetch('/api/posts');
      const allPosts = await res.json();
      let totalLikes = 0;
      let totalComments = 0;

      allPosts.forEach(post => {
        totalLikes += (post.likes || 0);
        totalComments += (post.comments ? post.comments.length : 0);
      });

      return {
        totalPosts: allPosts.length,
        totalLikes,
        totalComments
      };
    } catch (err) {
      console.error("فشل استخراج الإحصائيات:", err);
      return { totalPosts: 0, totalLikes: 0, totalComments: 0 };
    }
  }
}

// 6. مسجل نشاطات المستخدم المحلي (Activity Logger)
class ActivityLogger {
  constructor() {
    this.activities = JSON.parse(localStorage.getItem("activities")) || [];
  }

  logActivity(type, details) {
    const activity = {
      id: Date.now(),
      type,
      details,
      timestamp: new Date().toLocaleString('ar-SA')
    };
    this.activities.unshift(activity);
    if (this.activities.length > 50) this.activities.pop();
    localStorage.setItem("activities", JSON.stringify(this.activities));
  }
}

// 7. نظام الوضع الليلي (Dark Mode System)
class DarkModeSystem {
  constructor() {
    this.enabled = localStorage.getItem("darkMode") === "true";
    this.apply();
  }

  toggleDarkMode() {
    this.enabled = !this.enabled;
    localStorage.setItem("darkMode", this.enabled);
    this.apply();
  }

  apply() {
    document.body.classList.toggle("dark", this.enabled);
  }
}

// 8. نظام تصدير البيانات احتياطياً (Export Data)
class ExportSystem {
  async exportJSON() {
    try {
      const res = await fetch('/api/posts');
      const posts = await res.json();
      const backupData = {
        posts,
        activities: JSON.parse(localStorage.getItem("activities")) || [],
        following: JSON.parse(localStorage.getItem("following")) || {}
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `softgram_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert("فشل في استخراج نسخة احتياطية من السيرفر.");
    }
  }
}

// 9. نظام الحفظ (Save System)
class SaveSystem {
  constructor() {
    this.savedIds = JSON.parse(localStorage.getItem("savedPosts")) || [];
  }

  toggleSave(postId) {
    if (this.savedIds.includes(postId)) {
      this.savedIds = this.savedIds.filter(id => id !== postId);
    } else {
      this.savedIds.push(postId);
    }
    localStorage.setItem("savedPosts", JSON.stringify(this.savedIds));
  }

  isSaved(postId) {
    return this.savedIds.includes(postId);
  }
}

// 10. نظام القصص اليومية (Stories System) - [ميزة جديدة]
class StoriesSystem {
  constructor() {
    this.stories = JSON.parse(localStorage.getItem("stories")) || {};
  }

  addStory(imageSrc) {
    const currentUser = localStorage.getItem("currentUser") || "ضيف";
    if (!this.stories[currentUser]) this.stories[currentUser] = [];
    
    this.stories[currentUser].push({
      id: Date.now(),
      src: imageSrc,
      timestamp: Date.now()
    });
    this.save();
    if (typeof activityLogger !== 'undefined') {
      activityLogger.logActivity("story", "تمت إضافة قصة يومية جديدة");
    }
  }

  getActiveStories() {
    const oneDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    Object.keys(this.stories).forEach(user => {
      this.stories[user] = this.stories[user].filter(story => (now - story.timestamp) < oneDay);
      if (this.stories[user].length === 0) delete this.stories[user];
    });
    this.save();
    return this.stories;
  }

  save() {
    localStorage.setItem("stories", JSON.stringify(this.stories));
  }
}

// 11. نظام مؤشر الكتابة الفوري (Typing Indicator) - [ميزة جديدة]
class TypingIndicator {
  constructor() {
    this.typingUsers = new Set();
  }

  setUserTyping(username, isTyping) {
    if (isTyping) {
      this.typingUsers.add(username);
    } else {
      this.typingUsers.delete(username);
    }
    this.updateUI();
  }

  updateUI() {
    const indicatorEl = document.getElementById("typing-indicator");
    if (!indicatorEl) return;
    
    if (this.typingUsers.size > 0) {
      const users = Array.from(this.typingUsers).join(", ");
      indicatorEl.textContent = `✍️ ${users} يكتب الآن...`;
      indicatorEl.style.display = "block";
    } else {
      indicatorEl.style.display = "none";
    }
  }
}

// 12. نظام التفاعل مع المنشورات بالإيموجي (Emoji Reactions) - [ميزة جديدة]
class ReactionSystem {
  constructor() {
    this.reactions = JSON.parse(localStorage.getItem("postReactions")) || {};
  }

  addReaction(postId, emoji) {
    const currentUser = localStorage.getItem("currentUser") || "ضيف";
    if (!this.reactions[postId]) this.reactions[postId] = {};
    
    this.reactions[postId][currentUser] = emoji;
    localStorage.setItem("postReactions", JSON.stringify(this.reactions));
    
    if (typeof activityLogger !== 'undefined') {
      activityLogger.logActivity("reaction", `تفاعل بـ ${emoji} على المنشور ${postId}`);
    }
  }

  getReactionCounts(postId) {
    const postReactions = this.reactions[postId] || {};
    const counts = {};
    Object.values(postReactions).forEach(emoji => {
      counts[emoji] = (counts[emoji] || 0) + 1;
    });
    return counts;
  }
}

// 13. نظام شارات التوثيق للمستخدمين (Verification Badges) - [ميزة جديدة]
class VerificationSystem {
  constructor() {
    this.verifiedUsers = {
      "admin": "gold",
      "nabil": "blue", 
      "developer": "blue"
    };
  }

  isVerified(username) {
    return this.verifiedUsers[username] || null;
  }

  getBadgeHtml(username) {
    const type = this.isVerified(username);
    if (type === "gold") return `<span class="badge gold" title="حساب مطور" style="color:var(--accent); margin-right:4px;">👑</span>`;
    if (type === "blue") return `<span class="badge blue" title="حساب موثق" style="color:#3897f0; margin-right:4px;">✔️</span>`;
    return "";
  }
}

// 14. تفعيل وتجهيز الكائنات البرمجية (Instantiation)
const searchEngine = new SearchEngine();
const followSystem = new FollowSystem();
const notificationSystem = new NotificationSystem();
const hashtags = new HashtagSystem();
const statistics = new StatisticsSystem();
const activityLogger = new ActivityLogger();
const darkMode = new DarkModeSystem();
const exportData = new ExportSystem();
const saveSystem = new SaveSystem();

// تفعيل المميزات المتطورة المضافة حديثاً
const storiesSystem = new StoriesSystem();
const typingIndicator = new TypingIndicator();
const reactionSystem = new ReactionSystem();
const verificationSystem = new VerificationSystem();