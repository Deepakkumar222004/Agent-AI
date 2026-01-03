// Textarea Auto-resize
const textarea = document.getElementById('user-input');
textarea.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

function handleEnter(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById("user-input");
    const message = input.value.trim();
    if (!message) return;

    // Reset textarea height
    input.style.height = 'auto';
    input.value = "";

    appendMessage(message, "user");
    appendTypingIndicator();

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: message })
        });

        const data = await response.json();
        removeTypingIndicator();

        const formatted = formatResponse(data);
        appendBotMessage(formatted.text, formatted.agent);

    } catch (error) {
        removeTypingIndicator();
        appendBotMessage("❌ **Server error:** Could not connect to the backend.", "System");
        console.error(error);
    }
}

// File Upload Handling
function triggerFileUpload() {
    document.getElementById("file-input").click();
}

async function handleFileUpload(file) {
    if (!file) return;

    appendMessage(`Uploading **${file.name}**...`, "System"); // Show as system/user action?
    appendTypingIndicator();

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("/document/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        removeTypingIndicator();
        appendBotMessage(data.response, "Document Agent");
    } catch (error) {
        removeTypingIndicator();
        appendBotMessage("❌ **Upload failed**", "System");
    }
}

// Drag and Drop
const dropZone = document.getElementById('drop-zone');
const mainContent = document.querySelector('.main-content');

window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dropZone.classList.remove('hidden');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.add('hidden');
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.add('hidden');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
});


// UI Helpers
function appendMessage(text, type) {
    const chatBox = document.getElementById("chat-box");
    const div = document.createElement("div");
    div.className = `message ${type}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.innerHTML = type === 'user' ? 'U' : '<i class="fa-solid fa-robot"></i>';

    const content = document.createElement("div");
    content.className = "content markdown-body";
    content.innerHTML = marked.parse(text);

    div.appendChild(avatar);
    div.appendChild(content);

    chatBox.appendChild(div);
    scrollToBottom();
}

function appendBotMessage(text, agent) {
    const chatBox = document.getElementById("chat-box");
    const div = document.createElement("div");
    div.className = "message bot";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.innerHTML = '<i class="fa-solid fa-robot"></i>';

    const content = document.createElement("div");
    content.className = "content markdown-body";

    // Add Agent Badge
    const badge = `<span class="badge" style="background: rgba(99, 102, 241, 0.1); color: #818cf8; padding: 2px 8px; border-radius: 4px; font-size: 0.75em; margin-bottom: 5px; display: inline-block;">${agent}</span>`;

    content.innerHTML = badge + marked.parse(text);

    div.appendChild(avatar);
    div.appendChild(content);

    chatBox.appendChild(div);
    scrollToBottom();
}

function appendTypingIndicator() {
    const chatBox = document.getElementById("chat-box");
    const div = document.createElement("div");
    div.id = "typing";
    div.className = "message bot";

    div.innerHTML = `
        <div class="avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="content" style="display: flex; gap: 5px; align-items: center; padding: 15px;">
            <div style="width: 6px; height: 6px; background: #9aa0a6; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both;"></div>
            <div style="width: 6px; height: 6px; background: #9aa0a6; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.32s;"></div>
            <div style="width: 6px; height: 6px; background: #9aa0a6; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.16s;"></div>
        </div>
        <style>
            @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        </style>
    `;

    chatBox.appendChild(div);
    scrollToBottom();
}

function removeTypingIndicator() {
    const typing = document.getElementById("typing");
    if (typing) typing.remove();
}

function scrollToBottom() {
    const chatBox = document.getElementById("chat-box");
    chatBox.scrollTop = chatBox.scrollHeight;
}

function clearChat() {
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = `
        <div class="message bot intro">
            <div class="avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="content">
                <p>Chat cleared.</p>
            </div>
        </div>
    `;
}

function setQuickPrompt(text) {
    document.getElementById("user-input").value = text;
    // Auto-resize
    const input = document.getElementById("user-input");
    input.style.height = 'auto';
    input.style.height = (input.scrollHeight) + 'px';
    input.focus();
}

function formatResponse(data) {
    if (typeof data.response === "string") {
        return { text: data.response, agent: data.agent ? data.agent + " Agent" : "System" };
    }

    if (typeof data.response === "object") {
        if (data.response.description) {
            let output = `### Weather Report\n\n`;
            if (data.city) output += `**${data.city}**\n\n`;

            output += `- 🌤 **Condition:** ${data.response.description}\n`;
            output += `- 🌡 **Temp:** ${data.response.temperature}\n`;

            if (data.date && data.date !== "undefined") {
                output += `- 📅 **Date:** ${data.date}`;
            }

            return {
                text: output,
                agent: "Weather Agent"
            };
        }
        return {
            text: "```json\n" + JSON.stringify(data.response, null, 2) + "\n```",
            agent: data.agent + " Agent"
        };
    }

    return { text: String(data.response), agent: "System" };
}

function loadChat(type) {
    // Placeholder for multiple chat sessions feature
    console.log("Switching to chat:", type);
}
