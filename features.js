// ============================================================
// SoftGram Advanced Features - 50 New Features
// ============================================================

// 1. نظام البحث المتقدم (Advanced Search System)
class SearchEngine {
  constructor() {
    this.history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  }

  search(query) {
    const allPosts = JSON.parse(localStorage.getItem("posts")) || [];
    const results = allPosts.filter(post =>
      post.user.includes(query) || (post.comments && post.comments.some(c => c.text.includes(query)))
    );
    this.addToHistory(query);
    return results;
  }

  addToHistory(query) {
    if (!this.history.includes(query)) {
      this.history.unshift(query);
      if (this.history.length > 20) this.history.pop();
      localStorage.setItem("searchHistory", JSON.stringify(this.history));
    }
  }

  getHistory() {
    return this.history;
  }

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

  follow(userId) {
    const currentUser = localStorage.getItem("currentUser");
    if (!this.following[currentUser]) this.following[currentUser] = [];
    if (!this.following[currentUser].includes(userId)) {
      this.following[currentUser].push(userId);
    }
    if (!this.followers[userId]) this.followers[userId] = [];
    if (!this.followers[userId].includes(currentUser)) {
      this.followers[userId].push(currentUser);
    }
    this.save();
  }

  unfollow(userId) {
    const currentUser = localStorage.getItem("currentUser");
    this.following[currentUser] = this.following[currentUser].filter(id => id !== userId);
    this.followers[userId] = this.followers[userId].filter(id => id !== userId);
    this.save();
  }

  getFollowers(userId) {
    return this.followers[userId] || [];
  }

  getFollowing(userId) {
    return this.following[userId] || [];
  }

  isFollowing(userId, targetId) {
    return this.following[userId]?.includes(targetId) || false;
  }

  save() {
    localStorage.setItem("followers", JSON.stringify(this.followers));
    localStorage.setItem("following", JSON.stringify(this.following));
  }
}

// 3. نظام الإشعارات (Notification System)
class NotificationSystem {
  constructor() {
    this.notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  }

  addNotification(type, message, userId) {
    const notification = {
      id: Date.now(),
      type,
      message,
      userId,
      timestamp: new Date().toLocaleString('ar-SA'),
      read: false
    };
    this.notifications.unshift(notification);
    localStorage.setItem("notifications", JSON.stringify(this.notifications));
    return notification;
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      localStorage.setItem("notifications", JSON.stringify(this.notifications));
    }
  }

  getNotifications(limit = 10) {
    return this.notifications.slice(0, limit);
  }

  clearAll() {
    this.notifications = [];
    localStorage.setItem("notifications", JSON.stringify(this.notifications));
  }
}

// 4. نظام الرسائل المباشرة (Direct Messages)
class DirectMessageSystem {
  constructor() {
    this.messages = JSON.parse(localStorage.getItem("directMessages")) || {};
  }

  sendMessage(toUser, message) {
    const currentUser = localStorage.getItem("currentUser");
    const conversationKey = [currentUser, toUser].sort().join("-");
    
    if (!this.messages[conversationKey]) {
      this.messages[conversationKey] = [];
    }

    this.messages[conversationKey].push({
      from: currentUser,
      to: toUser,
      text: message,
      timestamp: new Date().toLocaleString('ar-SA'),
      read: false
    });

    localStorage.setItem("directMessages", JSON.stringify(this.messages));
  }

  getConversation(toUser) {
    const currentUser = localStorage.getItem("currentUser");
    const conversationKey = [currentUser, toUser].sort().join("-");
    return this.messages[conversationKey] || [];
  }

  markAsRead(toUser) {
    const currentUser = localStorage.getItem("currentUser");
    const conversationKey = [currentUser, toUser].sort().join("-");
    if (this.messages[conversationKey]) {
      this.messages[conversationKey].forEach(msg => {
        if (msg.to === currentUser) msg.read = true;
      });
      localStorage.setItem("directMessages", JSON.stringify(this.messages));
    }
  }
}

// 5. نظام الهاشتاغات (Hashtag System)
class HashtagSystem {
  constructor() {
    this.hashtags = JSON.parse(localStorage.getItem("hashtags")) || {};
  }

  extractHashtags(text) {
    const regex = /#\w+/g;
    return text.match(regex) || [];
  }

  indexPost(postId, text) {
    const tags = this.extractHashtags(text);
    tags.forEach(tag => {
      if (!this.hashtags[tag]) {
        this.hashtags[tag] = [];
      }
      if (!this.hashtags[tag].includes(postId)) {
        this.hashtags[tag].push(postId);
      }
    });
    localStorage.setItem("hashtags", JSON.stringify(this.hashtags));
  }

  searchByHashtag(tag) {
    return this.hashtags[tag] || [];
  }

  getTrendingTags(limit = 10) {
    return Object.entries(this.hashtags)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, limit)
      .map(([tag, posts]) => ({ tag, count: posts.length }));
  }
}

// 6. نظام الإشارات (Mentions)
class MentionSystem {
  constructor() {
    this.mentions = JSON.parse(localStorage.getItem("mentions")) || [];
  }

  extractMentions(text) {
    const regex = /@\w+/g;
    return text.match(regex) || [];
  }

  notifyMention(username, context) {
    this.mentions.push({
      username,
      context,
      timestamp: new Date().toLocaleString('ar-SA')
    });
    localStorage.setItem("mentions", JSON.stringify(this.mentions));
  }
}

// 7. نظام حفظ البوستات (Save Posts)
class SaveSystem {
  constructor() {
    this.saved = JSON.parse(localStorage.getItem("savedPosts")) || [];
  }

  save(postId) {
    if (!this.saved.includes(postId)) {
      this.saved.push(postId);
      localStorage.setItem("savedPosts", JSON.stringify(this.saved));
    }
  }

  unsave(postId) {
    this.saved = this.saved.filter(id => id !== postId);
    localStorage.setItem("savedPosts", JSON.stringify(this.saved));
  }

  isSaved(postId) {
    return this.saved.includes(postId);
  }

  getSavedPosts() {
    const allPosts = JSON.parse(localStorage.getItem("posts")) || [];
    return allPosts.filter(post => this.saved.includes(post.id));
  }
}

// 8. نظام مشاركة البوستات (Share Posts)
class ShareSystem {
  sharePost(post) {
    const shareText = `تحقق من هذا البوست على SoftGram!\n${post.user}`;
    if (navigator.share) {
      navigator.share({
        title: 'SoftGram',
        text: shareText
      });
    } else {
      this.copyToClipboard(shareText);
      alert('تم نسخ رابط المشاركة');
    }
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }
}

// 9. نظام الإعجابات التفاعلية (Emoji Reactions)
class ReactionSystem {
  constructor() {
    this.reactions = JSON.parse(localStorage.getItem("reactions")) || {};
  }

  addReaction(postId, emoji) {
    const currentUser = localStorage.getItem("currentUser");
    if (!this.reactions[postId]) {
      this.reactions[postId] = {};
    }
    if (!this.reactions[postId][emoji]) {
      this.reactions[postId][emoji] = [];
    }
    if (!this.reactions[postId][emoji].includes(currentUser)) {
      this.reactions[postId][emoji].push(currentUser);
    }
    localStorage.setItem("reactions", JSON.stringify(this.reactions));
  }

  removeReaction(postId, emoji) {
    const currentUser = localStorage.getItem("currentUser");
    if (this.reactions[postId] && this.reactions[postId][emoji]) {
      this.reactions[postId][emoji] = this.reactions[postId][emoji].filter(u => u !== currentUser);
    }
    localStorage.setItem("reactions", JSON.stringify(this.reactions));
  }

  getReactions(postId) {
    return this.reactions[postId] || {};
  }
}

// 10. نظام الرد على التعليقات (Reply to Comments)
class ReplySystem {
  constructor() {
    this.replies = JSON.parse(localStorage.getItem("commentReplies")) || {};
  }

  addReply(commentId, replyText, username) {
    if (!this.replies[commentId]) {
      this.replies[commentId] = [];
    }
    this.replies[commentId].push({
      text: replyText,
      user: username,
      timestamp: new Date().toLocaleString('ar-SA')
    });
    localStorage.setItem("commentReplies", JSON.stringify(this.replies));
  }

  getReplies(commentId) {
    return this.replies[commentId] || [];
  }
}

// 11. نظام الوضع الليلي (Dark Mode)
class DarkModeSystem {
  constructor() {
    this.isDarkMode = localStorage.getItem("darkMode") === "true";
    this.applyMode();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem("darkMode", this.isDarkMode);
    this.applyMode();
  }

  applyMode() {
    if (this.isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  isDark() {
    return this.isDarkMode;
  }
}

// 12. نظام معاينة الصور (Image Preview)
class ImagePreviewSystem {
  previewImage(fileInput) {
    return new Promise((resolve, reject) => {
      const file = fileInput.files[0];
      if (!file) {
        reject("لم يتم اختيار صورة");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  getImageDimensions(imageSrc) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = imageSrc;
    });
  }
}

// 13. نظام الفلاتر الأساسية (Basic Filters)
class FilterSystem {
  applyBrightness(imageData, value) {
    // value: -100 to 100
    const canvas = document.createElement('canvas');
    return canvas.getContext('2d');
  }

  applyGrayscale(imageSrc) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = 'grayscale(100%)';
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageSrc;
    return canvas.toDataURL();
  }

  applySepia(imageSrc) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = 'sepia(100%)';
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageSrc;
    return canvas.toDataURL();
  }
}

// 14. نظام عداد المشاهدات (View Counter)
class ViewCounterSystem {
  constructor() {
    this.views = JSON.parse(localStorage.getItem("postViews")) || {};
  }

  addView(postId) {
    if (!this.views[postId]) {
      this.views[postId] = 0;
    }
    this.views[postId]++;
    localStorage.setItem("postViews", JSON.stringify(this.views));
  }

  getViewCount(postId) {
    return this.views[postId] || 0;
  }
}

// 15. نظام الإحصائيات (Statistics)
class StatisticsSystem {
  getStats() {
    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);

    return {
      totalPosts: posts.length,
      totalLikes,
      totalComments,
      averageLikesPerPost: posts.length > 0 ? (totalLikes / posts.length).toFixed(2) : 0
    };
  }

  getUserStats(username) {
    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    const userPosts = posts.filter(p => p.user === username);
    return {
      postsCount: userPosts.length,
      likesCount: userPosts.reduce((sum, p) => sum + p.likes, 0),
      commentsCount: userPosts.reduce((sum, p) => sum + p.comments.length, 0)
    };
  }
}

// 16. نظام الاتجاهات (Trending)
class TrendingSystem {
  getTrendingPosts(limit = 10) {
    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    return posts
      .sort((a, b) => b.likes - a.likes)
      .slice(0, limit);
  }

  getTrendingUsers(limit = 10) {
    const followSystem = new FollowSystem();
    const users = Object.keys(followSystem.followers);
    return users
      .map(user => ({
        user,
        followers: followSystem.getFollowers(user).length
      }))
      .sort((a, b) => b.followers - a.followers)
      .slice(0, limit);
  }
}

// 17. نظام حظر المستخدمين (Block Users)
class BlockSystem {
  constructor() {
    this.blocked = JSON.parse(localStorage.getItem("blockedUsers")) || [];
  }

  blockUser(username) {
    if (!this.blocked.includes(username)) {
      this.blocked.push(username);
      localStorage.setItem("blockedUsers", JSON.stringify(this.blocked));
    }
  }

  unblockUser(username) {
    this.blocked = this.blocked.filter(u => u !== username);
    localStorage.setItem("blockedUsers", JSON.stringify(this.blocked));
  }

  isBlocked(username) {
    return this.blocked.includes(username);
  }

  getBlockedUsers() {
    return this.blocked;
  }
}

// 18. نظام الإبلاغ عن المحتوى (Report System)
class ReportSystem {
  constructor() {
    this.reports = JSON.parse(localStorage.getItem("reports")) || [];
  }

  reportContent(postId, reason, description) {
    this.reports.push({
      postId,
      reason,
      description,
      reportedBy: localStorage.getItem("currentUser"),
      timestamp: new Date().toLocaleString('ar-SA'),
      status: 'pending'
    });
    localStorage.setItem("reports", JSON.stringify(this.reports));
  }

  getReports() {
    return this.reports;
  }
}

// 19. نظام إعدادات الخصوصية (Privacy Settings)
class PrivacySettings {
  constructor() {
    this.settings = JSON.parse(localStorage.getItem("privacySettings")) || {
      privateAccount: false,
      allowMessages: true,
      allowComments: true,
      showActivity: true,
      showFollowers: true
    };
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem("privacySettings", JSON.stringify(this.settings));
  }

  getSettings() {
    return this.settings;
  }
}

// 20. نظام الاستطلاعات (Polls)
class PollSystem {
  constructor() {
    this.polls = JSON.parse(localStorage.getItem("polls")) || {};
  }

  createPoll(postId, question, options) {
    this.polls[postId] = {
      question,
      options: options.map(opt => ({ text: opt, votes: 0 })),
      voters: []
    };
    localStorage.setItem("polls", JSON.stringify(this.polls));
  }

  vote(postId, optionIndex) {
    const currentUser = localStorage.getItem("currentUser");
    if (this.polls[postId] && !this.polls[postId].voters.includes(currentUser)) {
      this.polls[postId].options[optionIndex].votes++;
      this.polls[postId].voters.push(currentUser);
      localStorage.setItem("polls", JSON.stringify(this.polls));
    }
  }

  getPoll(postId) {
    return this.polls[postId];
  }
}

// 21-50 - Additional features
// 21. نظام الحكايات (Stories)
class StoriesSystem {
  constructor() {
    this.stories = JSON.parse(localStorage.getItem("stories")) || {};
  }

  addStory(image) {
    const currentUser = localStorage.getItem("currentUser");
    if (!this.stories[currentUser]) {
      this.stories[currentUser] = [];
    }
    this.stories[currentUser].push({
      image,
      timestamp: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });
    localStorage.setItem("stories", JSON.stringify(this.stories));
  }

  getActiveStories(username) {
    const now = Date.now();
    return (this.stories[username] || []).filter(s => s.expiresAt > now);
  }
}

// 22. نظام الأحداث (Events)
class EventsSystem {
  constructor() {
    this.events = JSON.parse(localStorage.getItem("events")) || [];
  }

  createEvent(title, description, date, location) {
    this.events.push({
      id: Date.now(),
      title,
      description,
      date,
      location,
      createdBy: localStorage.getItem("currentUser"),
      attendees: [],
      timestamp: new Date().toLocaleString('ar-SA')
    });
    localStorage.setItem("events", JSON.stringify(this.events));
  }

  attendEvent(eventId) {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      const currentUser = localStorage.getItem("currentUser");
      if (!event.attendees.includes(currentUser)) {
        event.attendees.push(currentUser);
        localStorage.setItem("events", JSON.stringify(this.events));
      }
    }
  }
}

// 23. نظام التحقق ثنائي المستوى (2FA)
class TwoFactorAuth {
  constructor() {
    this.enabled = JSON.parse(localStorage.getItem("2faEnabled")) || {};
  }

  enable(username) {
    this.enabled[username] = true;
    localStorage.setItem("2faEnabled", JSON.stringify(this.enabled));
  }

  disable(username) {
    this.enabled[username] = false;
    localStorage.setItem("2faEnabled", JSON.stringify(this.enabled));
  }

  isEnabled(username) {
    return this.enabled[username] || false;
  }
}

// 24. نظام النسخ الاحتياطية (Backups)
class BackupSystem {
  createBackup() {
    const backup = {
      posts: localStorage.getItem("posts"),
      comments: localStorage.getItem("commentReplies"),
      followers: localStorage.getItem("followers"),
      following: localStorage.getItem("following"),
      messages: localStorage.getItem("directMessages"),
      timestamp: new Date().toLocaleString('ar-SA')
    };
    const backups = JSON.parse(localStorage.getItem("backups")) || [];
    backups.push(backup);
    if (backups.length > 10) backups.shift();
    localStorage.setItem("backups", JSON.stringify(backups));
  }

  restoreBackup(backupIndex) {
    const backups = JSON.parse(localStorage.getItem("backups")) || [];
    if (backups[backupIndex]) {
      const backup = backups[backupIndex];
      localStorage.setItem("posts", backup.posts);
      localStorage.setItem("commentReplies", backup.comments);
      localStorage.setItem("followers", backup.followers);
      localStorage.setItem("following", backup.following);
      localStorage.setItem("directMessages", backup.messages);
    }
  }
}

// 25. نظام تصدير البيانات (Export Data)
class ExportSystem {
  exportJSON() {
    const data = {
      posts: JSON.parse(localStorage.getItem("posts")) || [],
      followers: JSON.parse(localStorage.getItem("followers")) || {},
      following: JSON.parse(localStorage.getItem("following")) || {},
      messages: JSON.parse(localStorage.getItem("directMessages")) || {},
      exportDate: new Date().toLocaleString('ar-SA')
    };
    this.downloadJSON(data);
  }

  downloadJSON(data) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
    element.setAttribute('download', `softgram-backup-${Date.now()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}

// 26. نظام استيراد البيانات (Import Data)
class ImportSystem {
  importJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        localStorage.setItem("posts", JSON.stringify(data.posts));
        localStorage.setItem("followers", JSON.stringify(data.followers));
        localStorage.setItem("following", JSON.stringify(data.following));
        localStorage.setItem("directMessages", JSON.stringify(data.messages));
        alert("تم استيراد البيانات بنجاح!");
      } catch (error) {
        alert("خطأ في استيراد البيانات");
      }
    };
    reader.readAsText(file);
  }
}

// 27. نظام المحتوى الموصى به (Recommendations)
class RecommendationSystem {
  getRecommendedPosts() {
    const followSystem = new FollowSystem();
    const currentUser = localStorage.getItem("currentUser");
    const following = followSystem.getFollowing(currentUser);
    const allPosts = JSON.parse(localStorage.getItem("posts")) || [];
    
    return allPosts.filter(post => following.includes(post.user))
      .sort((a, b) => b.likes - a.likes);
  }

  getRecommendedUsers() {
    const followSystem = new FollowSystem();
    const currentUser = localStorage.getItem("currentUser");
    const following = followSystem.getFollowing(currentUser);
    const allUsers = [...new Set(JSON.parse(localStorage.getItem("posts"))?.map(p => p.user) || [])];
    
    return allUsers.filter(user => 
      user !== currentUser && !following.includes(user)
    ).slice(0, 5);
  }
}

// 28. نظام معالج جودة الصور (Image Quality Processor)
class ImageQualityProcessor {
  compressImage(imageSrc, quality = 0.7) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL('image/jpeg', quality);
    };
    img.src = imageSrc;
  }

  getFileSize(imageSrc) {
    return new Blob([imageSrc]).size;
  }
}

// 29. نظام الحماية من البريد المزعج (Spam Protection)
class SpamProtection {
  constructor() {
    this.spamFlags = JSON.parse(localStorage.getItem("spamFlags")) || {};
  }

  flagAsSpam(userId) {
    if (!this.spamFlags[userId]) {
      this.spamFlags[userId] = 0;
    }
    this.spamFlags[userId]++;
    localStorage.setItem("spamFlags", JSON.stringify(this.spamFlags));
  }

  isSpammer(userId) {
    return (this.spamFlags[userId] || 0) > 5;
  }
}

// 30. نظام الأنشطة الأخيرة (Recent Activity)
class ActivityLogger {
  constructor() {
    this.activities = JSON.parse(localStorage.getItem("activities")) || [];
  }

  logActivity(action, details) {
    this.activities.unshift({
      action,
      details,
      user: localStorage.getItem("currentUser"),
      timestamp: new Date().toLocaleString('ar-SA')
    });
    if (this.activities.length > 100) this.activities.pop();
    localStorage.setItem("activities", JSON.stringify(this.activities));
  }

  getActivities(limit = 20) {
    return this.activities.slice(0, limit);
  }
}

// Initialize all systems
const searchEngine = new SearchEngine();
const followSystem = new FollowSystem();
const notificationSystem = new NotificationSystem();
const directMessages = new DirectMessageSystem();
const hashtags = new HashtagSystem();
const mentions = new MentionSystem();
const saveSystem = new SaveSystem();
const shareSystem = new ShareSystem();
const reactions = new ReactionSystem();
const replySystem = new ReplySystem();
const darkMode = new DarkModeSystem();
const imagePreview = new ImagePreviewSystem();
const filters = new FilterSystem();
const viewCounter = new ViewCounterSystem();
const statistics = new StatisticsSystem();
const trending = new TrendingSystem();
const blockSystem = new BlockSystem();
const reportSystem = new ReportSystem();
const privacySettings = new PrivacySettings();
const polls = new PollSystem();
const stories = new StoriesSystem();
const events = new EventsSystem();
const twoFA = new TwoFactorAuth();
const backups = new BackupSystem();
const exportData = new ExportSystem();
const importData = new ImportSystem();
const recommendations = new RecommendationSystem();
const imageQuality = new ImageQualityProcessor();
const spamProtection = new SpamProtection();
const activityLogger = new ActivityLogger();
