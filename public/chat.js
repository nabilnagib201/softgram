window.onload = function() {
  fetch('/api/messages')
    .then(res => res.json())
    .then(savedMessages => {
      savedMessages.forEach(msg => renderMessage(msg));
    });
};

function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (text === "") return;

  const currentUser = localStorage.getItem("currentUser") || "ضيف";
  const msg = { from: currentUser, to: "عام", text: text };

  fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msg)
  })
  .then(res => res.json())
  .then(data => {
    renderMessage(data.message);
    input.value = "";
  });
}

function renderMessage(msg) {
  const chatBox = document.getElementById('chat-box');
  if (!chatBox) return;
  const div = document.createElement('div');
  const currentUser = localStorage.getItem("currentUser") || "ضيف";
  div.className = 'chat-msg ' + (msg.from === currentUser ? 'sent' : 'received');
  div.innerHTML = `<p><strong>${msg.from}:</strong> ${msg.text}</p>`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}