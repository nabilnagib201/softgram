// تحميل الرسائل المحفوظة
window.onload = function() {
  const savedMessages = JSON.parse(localStorage.getItem("messages")) || [];
  savedMessages.forEach(msg => renderMessage(msg));
};

function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (text === "") return;

  const currentUser = localStorage.getItem("currentUser") || "ضيف";
  const msg = { text, time: new Date().toLocaleTimeString('ar-SA'), user: currentUser };
  renderMessage(msg);
  saveMessage(msg);

  input.value = "";
}

function renderMessage(msg) {
  const chatBox = document.getElementById('chat-box');
  const div = document.createElement('div');
  const currentUser = localStorage.getItem("currentUser");
  div.className = 'chat-msg ' + (msg.user === currentUser ? 'sent' : 'received');
  div.innerHTML = `<p>${msg.text}</p><small>${msg.time}</small>`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function saveMessage(msg) {
  let savedMessages = JSON.parse(localStorage.getItem("messages")) || [];
  savedMessages.push(msg);
  localStorage.setItem("messages", JSON.stringify(savedMessages));
}
