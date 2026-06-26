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

  const currentUser = localStorage.getItem("currentUser");
  let deleteBtn = "";
  if (post.user === currentUser) {
    deleteBtn = `<button class="delete-btn" onclick="deletePostItem(this)">🗑️</button>`;
  }

  const userInitial = post.user.charAt(0).toUpperCase();
  const isSaved = saveSystem.isSaved(post.id);
  const isFollowing = followSystem.isFollowing(currentUser, post.user);

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
      <button class="like-btn" onclick="toggleLike(this, '${post.id}')">❤️</button>
      <button class="send-comment">💬</button>
      <button class="delete-btn" onclick="toggleSave(this, '${post.id}')">${isSaved ? '💾' : '🔖'}</button>
      <button class="delete-btn" onclick="shareSystem.sharePost(${JSON.stringify(post).replace(/"/g, '&quot;')})">📤</button>
    </div>
    <div class="comments"></div>
    <input type="text" placeholder="اكتب تعليق..." class="comment-input" style="padding: 10px 15px; border: none; border-top: 1px solid var(--border-color); width: 100%; box-sizing: border-box;"/>
  `;

  const commentsDiv = postDiv.querySelector('.comments');

  post.comments.forEach(c => {
    const commentDiv = document.createElement('div');
    commentDiv.className = "comment-item";
    commentDiv.innerHTML = `<p><strong>${c.user}:</strong> ${c.text}</p>`;
    if (c.user === currentUser) {
      const del = document.createElement('button');
      del.textContent = "🗑️";
      del.className = "delete-btn";
      del.onclick = () => {
        post.comments = post.comments.filter(x => x !== c);
        commentDiv.remove();
        updateStorage();
      };
      commentDiv.appendChild(del);
    }
    commentsDiv.appendChild(commentDiv);
  });

  if (post.user === currentUser) {
    postDiv.querySelector('.delete-btn').onclick = () => {
      deletePostItem(postDiv.querySelector('.delete-btn'));
    };
  }

  const likeBtn = postDiv.querySelector('.like-btn');
  likeBtn.textContent = `❤️ ${post.likes}`;

  postDiv.querySelector('.send-comment').onclick = () => {
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
  const post = allPosts.find(p => p.id === postId);
  if (post) {
    post.likes++;
    btn.textContent = `❤️ ${post.likes}`;
    reactions.addReaction(postId, '❤️');
    updateStorage();
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

function deletePostItem(btn) {
  const post = btn.closest('.post');
  const src = post.querySelector('img').src;
  post.remove();
  deletePost(src);
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
  const allPosts = [];
  document.querySelectorAll('.post').forEach(postDiv => {
    const src = postDiv.querySelector('img').src;
    const likes = parseInt(postDiv.querySelector('.like-btn').textContent.replace(/[^\d]/g, "")) || 0;
    const comments = [];
    postDiv.querySelectorAll('.comments .comment-item p').forEach(p => {
      const text = p.textContent.split(': ').slice(1).join(': ');
      comments.push({ text, user: localStorage.getItem("currentUser") });
    });
    allPosts.push({ src, likes, comments, user: localStorage.getItem("currentUser") });
  });
  localStorage.setItem("posts", JSON.stringify(allPosts));
}
