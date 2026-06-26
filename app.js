// تحميل البوستات المحفوظة
window.onload = function() {
  const savedPosts = JSON.parse(localStorage.getItem("posts")) || [];
  savedPosts.forEach((post, index) => {
    post.id = post.id || Date.now() + index;
    renderPost(post);
  });
};

function addPost() {
  const upload = document.getElementById('upload');
  const file = upload.files[0];
  if (!file) return alert("اختر صورة أولاً!");

  const reader = new FileReader();
  reader.onload = function(e) {
    const currentUser = localStorage.getItem("currentUser") || "ضيف";
    const postId = Date.now();
    const newPost = { 
      id: postId,
      src: e.target.result, 
      likes: 0, 
      comments: [], 
      user: currentUser,
      timestamp: new Date().toLocaleString('ar-SA'),
      views: 0,
      saved: false,
      reactions: {}
    };
    
    // فهرسة الهاشتاغات والإشارات
    hashtags.indexPost(postId, newPost.user);
    
    // تسجيل النشاط
    activityLogger.logActivity('post_created', { user: currentUser, postId });
    
    savePost(newPost);
    renderPost(newPost, true);
    upload.value = '';
  };
  reader.readAsDataURL(file);
}

function renderPost(post, prepend=false) {
  const feed = document.getElementById('feed');
  const postDiv = document.createElement('div');
  postDiv.className = 'post';
  postDiv.setAttribute('data-post-id', post.id);

  const currentUser = localStorage.getItem("currentUser");
  const userInitial = post.user.charAt(0).toUpperCase();
  const isSaved = saveSystem.isSaved(post.id);
  const isFollowing = followSystem.isFollowing(currentUser, post.user);

  let deleteBtn = "";
  if (post.user === currentUser) {
    deleteBtn = `<button class="delete-btn" onclick="deletePostItem(event)">🗑️</button>`;
  }

  postDiv.innerHTML = `
    <div class="post-header">
      <div class="post-user-info">
        <div class="post-user-avatar">${userInitial}</div>
        <div>
          <div class="post-user-name">${post.user}</div>
          <small style="color: var(--text-light);">${post.timestamp || 'الآن'}</small>
        </div>
      </div>
      <div style="display: flex; gap: 10px;">
        ${isFollowing && post.user !== currentUser ? `<button class="delete-btn" onclick="followSystem.unfollow('${post.user}'); alert('تم إلغاء المتابعة');">👥</button>` : (post.user !== currentUser ? `<button class="delete-btn" onclick="followSystem.follow('${post.user}'); alert('تم المتابعة');">➕</button>` : '')}
        ${deleteBtn}
      </div>
    </div>
    <img src="${post.src}" alt="post" class="post-img" onclick="viewCounter.addView('${post.id}')">
    <div style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; color: var(--text-light);">👁️ ${post.views || 0} مشاهدات</div>
    <div class="actions">
      <button class="like-btn" onclick="toggleLike(this, ${post.id})">❤️ ${post.likes || 0}</button>
      <button class="send-comment">💬</button>
      <button class="save-btn" onclick="toggleSave(this, ${post.id})">${isSaved ? '💾' : '🔖'}</button>
      <button class="share-btn" onclick="shareSystem.sharePost('${post.id}')">📤</button>
    </div>
    <div class="comments"></div>
    <div style="display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border-color);">
      <input type="text" placeholder="اكتب تعليق..." class="comment-input" style="flex: 1; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.9rem;"/>
      <button class="send-comment-btn" onclick="addCommentToPost(this, ${post.id})">إرسال</button>
    </div>
  `;

  const commentsDiv = postDiv.querySelector('.comments');
  const likeBtn = postDiv.querySelector('.like-btn');

  post.comments.forEach(c => {
    const commentDiv = document.createElement('div');
    commentDiv.className = "comment-item";
    commentDiv.innerHTML = `<p><strong>${c.user}:</strong> ${c.text}</p>`;
    if (c.user === currentUser) {
      const del = document.createElement('button');
      del.textContent = "🗑️";
      del.className = "delete-btn";
      del.style.fontSize = "0.8rem";
      del.onclick = () => {
        post.comments = post.comments.filter(x => x !== c);
        commentDiv.remove();
        updateStorage();
      };
      commentDiv.appendChild(del);
    }
    commentsDiv.appendChild(commentDiv);
  });

  const sendCommentBtn = postDiv.querySelector('.send-comment');
  sendCommentBtn.onclick = () => {
    const input = postDiv.querySelector('.comment-input');
    if (input.value.trim() !== "") {
      const newComment = { text: input.value.trim(), user: currentUser };
      post.comments.push(newComment);

      const commentDiv = document.createElement('div');
      commentDiv.className = "comment-item";
      commentDiv.innerHTML = `<p><strong>${newComment.user}:</strong> ${newComment.text}</p>`;
      const del = document.createElement('button');
      del.textContent = "🗑️";
      del.className = "delete-btn";
      del.style.fontSize = "0.8rem";
      del.onclick = () => {
        post.comments = post.comments.filter(x => x !== newComment);
        commentDiv.remove();
        updateStorage();
      };
      commentDiv.appendChild(del);

      commentsDiv.appendChild(commentDiv);
      input.value = "";
      updateStorage();
      
      // تسجيل النشاط
      activityLogger.logActivity('comment_added', { user: currentUser, postId: post.id });
    }
  };

  if (prepend) feed.prepend(postDiv);
  else feed.appendChild(postDiv);
}

function toggleLike(btn, postId) {
  const allPosts = JSON.parse(localStorage.getItem("posts")) || [];
  const postIndex = allPosts.findIndex(p => p.id == postId);
  if (postIndex !== -1) {
    allPosts[postIndex].likes++;
    btn.textContent = `❤️ ${allPosts[postIndex].likes}`;
    reactions.addReaction(postId, '❤️');
    localStorage.setItem("posts", JSON.stringify(allPosts));
  }
}

function toggleSave(btn, postId) {
  if (saveSystem.isSaved(postId)) {
    saveSystem.unsave(postId);
    btn.textContent = '🔖';
  } else {
    saveSystem.save(postId);
    btn.textContent = '💾';
  }
}

function addCommentToPost(btn, postId) {
  const input = btn.closest('div').querySelector('.comment-input');
  if (input.value.trim() === "") {
    alert("اكتب تعليق أولاً!");
    return;
  }
  
  const allPosts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = allPosts.find(p => p.id == postId);
  if (post) {
    const currentUser = localStorage.getItem("currentUser") || "ضيف";
    const newComment = { text: input.value.trim(), user: currentUser };
    post.comments.push(newComment);
    localStorage.setItem("posts", JSON.stringify(allPosts));
    
    const commentDiv = document.createElement('div');
    commentDiv.className = "comment-item";
    commentDiv.innerHTML = `<p><strong>${newComment.user}:</strong> ${newComment.text}</p>`;
    const del = document.createElement('button');
    del.textContent = "🗑️";
    del.className = "delete-btn";
    del.style.fontSize = "0.8rem";
    del.onclick = () => {
      post.comments = post.comments.filter(x => x !== newComment);
      commentDiv.remove();
      localStorage.setItem("posts", JSON.stringify(allPosts));
    };
    commentDiv.appendChild(del);
    
    const commentsDiv = btn.closest('.post').querySelector('.comments');
    commentsDiv.appendChild(commentDiv);
    input.value = "";
    
    // تسجيل النشاط
    activityLogger.logActivity('comment_added', { user: currentUser, postId });
  }
}

function deletePostItem(event) {
  const postDiv = event.target.closest('.post');
  const postId = postDiv.getAttribute('data-post-id');
  
  if (confirm("هل تريد حقاً حذف هذا البوست؟")) {
    let allPosts = JSON.parse(localStorage.getItem("posts")) || [];
    allPosts = allPosts.filter(p => p.id != postId);
    localStorage.setItem("posts", JSON.stringify(allPosts));
    postDiv.remove();
    
    // تسجيل النشاط
    const currentUser = localStorage.getItem("currentUser");
    activityLogger.logActivity('post_deleted', { user: currentUser, postId });
  }
}

function savePost(post) {
  let savedPosts = JSON.parse(localStorage.getItem("posts")) || [];
  savedPosts.unshift(post);
  localStorage.setItem("posts", JSON.stringify(savedPosts));
}

function deletePost(src) {
  let savedPosts = JSON.parse(localStorage.getItem("posts")) || [];
  savedPosts = savedPosts.filter(p => p.src !== src);
  localStorage.setItem("posts", JSON.stringify(savedPosts));
}

function updateStorage() {
  // الدالة حالياً لا تحتاج إلى تحديث يدوي
  // لأن جميع التعديلات تحفظ مباشرة في localStorage
  const allPosts = JSON.parse(localStorage.getItem("posts")) || [];
  localStorage.setItem("posts", JSON.stringify(allPosts));
}
