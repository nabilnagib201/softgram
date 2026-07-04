window.onload = function() {
  fetch('/api/posts')
    .then(res => res.json())
    .then(savedPosts => {
      savedPosts.forEach((post, index) => {
        post.id = post.id || Date.now() + index;
        renderPost(post);
      });
      if (typeof updateStats === 'function') updateStats();
    })
    .catch(err => console.error("خطأ في جلب البوستات:", err));
};

function addPost() {
  const upload = document.getElementById('upload');
  const file = upload.files[0];
  if (!file) return alert("اختر صورة أولاً!");

  const reader = new FileReader();
  reader.onload = function(e) {
    const currentUser = localStorage.getItem("currentUser") || "ضيف";
    const newPost = { 
      id: Date.now(),
      src: e.target.result, 
      likes: 0, 
      comments: [], 
      user: currentUser,
      timestamp: new Date().toLocaleString('ar-SA')
    };
    
    savePost(newPost);
    renderPost(newPost, true);
    upload.value = '';
  };
  reader.readAsDataURL(file);
}

function renderPost(post, isNew = false) {
  const feed = document.getElementById('feed');
  if (!feed) return;

  const postDiv = document.createElement('div');
  postDiv.className = 'post';
  postDiv.setAttribute('data-post-id', post.id);

  postDiv.innerHTML = `
    <div class="post-header"><strong>@${post.user}</strong> <small>${post.timestamp}</small></div>
    <img src="${post.src}" class="post-img" style="width:100%; max-height:400px; object-fit:cover;">
    <div class="post-actions" style="padding:10px;">
      <button onclick="likePost(this)">❤️ <span class="like-count">${post.likes}</span></button>
      <button onclick="deletePostItem(event)" style="color:red; background:none; border:none; float:left; cursor:pointer;">🗑️ حذف</button>
    </div>
  `;
  if (isNew) feed.insertBefore(postDiv, feed.firstChild); else feed.appendChild(postDiv);
}

function savePost(post) {
  fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post)
  }).then(res => res.json());
}

function deletePostItem(event) {
  const postDiv = event.target.closest('.post');
  const postId = postDiv.getAttribute('data-post-id');
  if (confirm("هل تريد الحذف؟")) {
    fetch(`/api/posts?id=${postId}`, { method: 'DELETE' })
      .then(() => postDiv.remove());
  }
}