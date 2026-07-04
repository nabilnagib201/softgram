// ============================================================
// SoftGram Main Application - الواجهة الأمامية الشاملة
// المسار: public/app.js
// ============================================================

window.addEventListener('DOMContentLoaded', () => {
  loadFeedPosts();
});

// 1. جلب المنشورات من السيرفر وعرضها
function loadFeedPosts() {
  fetch('/api/posts')
    .then(res => res.json())
    .then(savedPosts => {
      const feed = document.getElementById('feed');
      if (feed) feed.innerHTML = ''; 
      
      savedPosts.forEach((post, index) => {
        post.id = post.id || "post_" + (Date.now() + index);
        renderPost(post);
      });
      if (typeof updateStats === 'function') updateStats();
    })
    .catch(err => console.error("خطأ في جلب البوستات:", err));
}

// 2. إضافة منشور جديد عن طريق رفع ملف صورة
function addPost() {
  const upload = document.getElementById('upload');
  const file = upload ? upload.files[0] : null;
  if (!file) return alert("اختر صورة أولاً لمشاركتها!");

  const reader = new FileReader();
  reader.onload = function(e) {
    const currentUser = localStorage.getItem("currentUser") || "ضيف";
    const newPost = { 
      id: "post_" + Date.now(),
      src: e.target.result, 
      likes: [], 
      comments: [], 
      user: currentUser,
      timestamp: new Date().toLocaleString('ar-SA')
    };
    
    savePost(newPost);
    renderPost(newPost, true);
    if (upload) upload.value = '';
  };
  reader.readAsDataURL(file);
}

// 3. بناء وتوليد كارت المنشور بتتصميم زيتي وذهبي
function renderPost(post, isNew = false) {
  const feed = document.getElementById('feed');
  if (!feed) return;

  const postDiv = document.createElement('div');
  postDiv.className = 'post-card';
  postDiv.setAttribute('data-post-id', post.id);

  const userBadge = typeof verificationSystem !== 'undefined' ? verificationSystem.getBadgeHtml(post.user) : '';
  const currentUser = localStorage.getItem("currentUser") || "";
  const hasLiked = post.likes && Array.isArray(post.likes) ? post.likes.includes(currentUser) : false;
  const likeIcon = hasLiked ? '❤️' : '🤍';
  const likedClass = hasLiked ? 'liked' : '';
  const likesCount = post.likes && Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);

  postDiv.innerHTML = `
    <div class="post-header" style="padding:15px; display:flex; align-items:center; gap:10px;">
      <div style="width:36px; height:36px; border-radius:50%; background:var(--secondary); display:flex; align-items:center; justify-content:center; font-weight:bold; color:var(--accent); border:1px solid var(--border-color);">
        ${post.user.charAt(0).toUpperCase()}
      </div>
      <div style="display:flex; flex-direction:column;">
        <strong style="color:var(--text-dark); font-size:0.95rem;">@${post.user} ${userBadge}</strong>
        <small style="color:var(--text-light); font-size:0.75rem;">${post.timestamp}</small>
      </div>
      <button onclick="deletePostItem('${post.id}')" style="color:#ff4d4d; background:none; border:none; margin-right:auto; cursor:pointer; font-size:0.9rem; opacity:0.6;">🗑️ حذف</button>
    </div>
    
    <img src="${post.src}" class="post-img" style="width:100%; max-height:450px; object-fit:cover; display:block;">
    
    <div class="post-actions">
      <button id="like-btn-${post.id}" class="action-button ${likedClass}" onclick="toggleLike('${post.id}')">
        ${likeIcon} <span id="like-count-${post.id}">${likesCount}</span>
      </button>
      <button class="action-button" onclick="document.getElementById('comment-input-${post.id}').focus()">
        💬 التعليقات
      </button>
      <button id="share-btn-${post.id}" class="action-button" onclick="sharePost('${post.id}')">
        🔗 مشاركة
      </button>
    </div>

    <div class="comments-section">
      <div id="comments-list-${post.id}" class="comments-display-list">
        ${post.comments && post.comments.length > 0 ? post.comments.map(c => `
          <div class="comment-bubble">
            <strong>@${c.user}:</strong> <span>${c.text}</span>
          </div>
        `).join('') : `<div style="color:var(--text-lighter); font-size:0.8rem; padding:5px 0;">لا توجد تعليقات بعد...</div>`}
      </div>
      
      <div class="comment-input-wrapper">
        <input type="text" id="comment-input-${post.id}" placeholder="اكتب تعليقاً عاماً..." onkeypress="if(event.key==='Enter') submitComment('${post.id}')">
        <button class="comment-submit-btn" onclick="submitComment('${post.id}')">نشر</button>
      </div>
    </div>
  `;

  if (isNew) feed.insertBefore(postDiv, feed.firstChild); else feed.appendChild(postDiv);
}

// دالة حفظ المنشور وإرساله للسيرفر ليعمل بشكل دائم
function savePost(post) {
  fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post)
  })
  .then(res => res.json())
  .catch(err => console.error("خطأ أثناء حفظ المنشور خلفياً:", err));
}

// 4. نظام الإعجابات المتزامن
function toggleLike(postId) {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return alert("يجب تسجيل الدخول أولاً!");

  fetch(`/api/posts?action=like&postId=${postId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentUser })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      const likeBtn = document.getElementById(`like-btn-${postId}`);
      const countSpan = document.getElementById(`like-count-${postId}`);
      if (countSpan && likeBtn) {
        countSpan.textContent = data.likesCount;
        if (data.isLiked) {
          likeBtn.classList.add('liked');
          likeBtn.innerHTML = `❤️ <span id="like-count-${postId}">${data.likesCount}</span>`;
        } else {
          likeBtn.classList.remove('liked');
          likeBtn.innerHTML = `🤍 <span id="like-count-${postId}">${data.likesCount}</span>`;
        }
      }
    }
  });
}

// 5. نظام التعليقات المتزامن
function submitComment(postId) {
  const currentUser = localStorage.getItem("currentUser");
  const inputEl = document.getElementById(`comment-input-${postId}`);
  const text = inputEl ? inputEl.value.trim() : "";

  if (!currentUser) return alert("يجب تسجيل الدخول لكتابة تعليق!");
  if (!text) return;

  fetch(`/api/posts?action=comment&postId=${postId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentUser, text })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      inputEl.value = '';
      const commentsList = document.getElementById(`comments-list-${postId}`);
      if (commentsList) {
        commentsList.innerHTML = data.comments.map(c => `
          <div class="comment-bubble">
            <strong>@${c.user}:</strong> <span>${c.text}</span>
          </div>
        `).join('');
      }
    }
  });
}

// 6. نظام المشاركة ونسخ الروابط
function sharePost(postId) {
  fetch(`/api/posts?action=share&postId=${postId}`, { method: 'POST' })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      const shareUrl = `${window.location.origin}/posts/${postId}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("🔗 تم نسخ رابط الصورة بنجاح!");
        const shareBtn = document.getElementById(`share-btn-${postId}`);
        if (shareBtn) shareBtn.innerHTML = `🔗 مشاركة (${data.sharesCount})`;
      });
    }
  });
}

// 7. نظام حذف المنشور
function deletePostItem(postId) {
  if (confirm("هل تريد حذف هذا المنشور؟")) {
    fetch(`/api/posts?id=${postId}`, { method: 'DELETE' })
      .then(() => {
        const postDiv = document.querySelector(`[data-post-id="${postId}"]`);
        if (postDiv) postDiv.remove();
      });
  }
}

// 8. نظام تشغيل وتصوير الكاميرا المباشر لـ SoftGram
let cameraStream = null;

// فتح الكاميرا وطلب الصلاحية من المستخدم
function openCamera() {
  const modal = document.getElementById('camera-modal');
  const video = document.getElementById('webcam');
  
  if (modal) modal.style.display = 'flex';

  navigator.mediaDevices.getUserMedia({ 
    video: { facingMode: "user", width: 640, height: 480 }, 
    audio: false 
  })
  .then(stream => {
    cameraStream = stream;
    if (video) video.srcObject = stream;
  })
  .catch(err => {
    console.error("خطأ في تشغيل الكاميرا:", err);
    alert("❌ عذراً، لم نتمكن من الوصول إلى الكاميرا. تأكد من إعطاء الصلاحية للمتصفح.");
    closeCamera();
  });
}

// إغلاق الكاميرا وإيقاف العدسة برمجياً
function closeCamera() {
  const modal = document.getElementById('camera-modal');
  if (modal) modal.style.display = 'none';
  
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
}

// التقاط اللحظة وتحويل الصورة لـ Base64 ورفعها فوراً للـ Feed
function takeSnapshot() {
  const video = document.getElementById('webcam');
  const canvas = document.getElementById('capture-canvas');
  
  if (!video || !canvas || !cameraStream) return;

  const context = canvas.getContext('2d');
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  // تأثير المرآة الطبيعي عند التصوير
  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  const imageDataURL = canvas.toDataURL('image/jpeg', 0.85);
  
  const currentUser = localStorage.getItem("currentUser") || "ضيف";
  const newCapturedPost = {
    id: "post_cap_" + Date.now(),
    src: imageDataURL,
    likes: [],
    comments: [],
    user: currentUser,
    timestamp: new Date().toLocaleString('ar-SA')
  };

  savePost(newCapturedPost);
  renderPost(newCapturedPost, true);
  closeCamera();
}