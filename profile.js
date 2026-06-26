window.onload = function() {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("username").textContent = currentUser;

  // عرض الإحصائيات
  const userStats = statistics.getUserStats(currentUser);
  document.getElementById("posts-count").textContent = userStats.postsCount;
  document.getElementById("followers-count").textContent = followSystem.getFollowers(currentUser).length;
  document.getElementById("following-count").textContent = followSystem.getFollowing(currentUser).length;

  // عرض البوستات
  const allPosts = JSON.parse(localStorage.getItem("posts")) || [];
  const userPosts = allPosts.filter(post => post.user === currentUser);

  const userPostsDiv = document.getElementById("user-posts");
  
  if (userPosts.length === 0) {
    userPostsDiv.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-light); grid-column: 1 / -1;">لم تنشر أي بوستات بعد</p>';
    return;
  }

  userPosts.forEach(post => {
    const postDiv = document.createElement("div");
    postDiv.className = "post";
    postDiv.style.cursor = 'pointer';
    postDiv.innerHTML = `<img src="${post.src}" alt="post" class="post-img" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">`;
    userPostsDiv.appendChild(postDiv);
  });
};

function showSettings() {
  document.getElementById("settings-modal").style.display = "flex";
  const settings = privacySettings.getSettings();
  document.getElementById("private-account").checked = settings.privateAccount;
  document.getElementById("allow-messages").checked = settings.allowMessages;
  document.getElementById("allow-comments").checked = settings.allowComments;
  document.getElementById("show-activity").checked = settings.showActivity;
}

function closeSettings() {
  document.getElementById("settings-modal").style.display = "none";
}

function saveSettings() {
  privacySettings.updateSettings({
    privateAccount: document.getElementById("private-account").checked,
    allowMessages: document.getElementById("allow-messages").checked,
    allowComments: document.getElementById("allow-comments").checked,
    showActivity: document.getElementById("show-activity").checked
  });
  alert("تم حفظ الإعدادات!");
  closeSettings();
}

function logout() {
  localStorage.removeItem("currentUser");
  alert("🚪 تم تسجيل الخروج بنجاح!");
  window.location.href = "login.html";
}
