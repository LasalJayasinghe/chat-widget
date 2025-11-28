window.EasyHelp = window.EasyHelp || {};

window.EasyHelp.init = function () {
  "use strict";

  if (window.EasyHelp._initialized) return;

  // ------------------------------------------------------------------------------------------
  // Shadow DOM Setup
  // ------------------------------------------------------------------------------------------

  const shadowHost = document.createElement("div");
  shadowHost.style.cssText =
    "position: fixed; bottom: 20px; right: 20px; z-index: 999999; flex-direction: column; display: flex;";
  document.body.appendChild(shadowHost);

  // Create shadow DOM for complete isolation
  const shadowRoot = shadowHost.attachShadow({ mode: "closed" });

  // Define all styles within shadow DOM - completely isolated
  const shadowStyles = `
   <style>
    :host {
      all: initial;
      display: flex !important;
      flex-direction: column !important;
    }

    /* RESET */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* UTILITIES */
    .hidden {
      display: none !important;
    }

    /* ------------------------- */
    /* MODERN FLOATING BUBBLE    */
    /* ------------------------- */
    .chat-bubble {
      width: 62px;
      height: 62px;
      background: #111827;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(0,0,0,0.28);
      transition: all 0.25s ease;
      transform: translateY(0px);
    }

    .chat-bubble:hover {
      transform: translateY(-4px) scale(1.06);
      background: #0f1624;
    }

    .chat-bubble svg {
      width: 34px;
      height: 34px;
      stroke: white;
    }

    /* ------------------------- */
    /* MODERN POPUP (GLASS UI)   */
    /* ------------------------- */
    .chat-popup {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 400px;
      height: 70vh;
      max-height: 70vh;

      background: rgba(255,255,255,0.86);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);

      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.25);
      box-shadow: 0 25px 55px rgba(0,0,0,0.35);

      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: Inter, system-ui, sans-serif;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    /* ------------------------- */
    /* HEADER                    */
    /* ------------------------- */
    .chat-header {
      background: #111827;
      padding: 18px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-header h3 {
      font-size: 17px;
      font-weight: 600;
    }

    .close-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
    }

    .close-btn:hover {
      background: rgba(255,255,255,0.08);
    }

    .close-btn svg {
      stroke: white;
      width: 22px;
      height: 22px;
    }

    /* ------------------------- */
    /* MESSAGES                  */
    /* ------------------------- */
    .chat-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: transparent;
    }

    .message-row {
      display: flex;
      margin-bottom: 14px;
    }

    .message-row.user {
      justify-content: flex-end;
    }

    .message-row.assistant {
      justify-content: flex-start;
    }

    .message-row.notice {
      justify-content: center;
    }

    .message-bubble {
      max-width: 75%;
      padding: 10px 16px;
      border-radius: 14px;
      line-height: 1.45;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    }

    .message-bubble.user {
      background: #111827;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .message-bubble.assistant {
      background: #f3f4f6;
      color: #111827;
      border-bottom-left-radius: 4px;
    }

    .message-bubble.notice {
      background: transparent;
      color: #6b7280;
      font-style: italic;
      box-shadow: none;
    }

    /* ------------------------- */
    /* TYPING DOTS LOADER        */
    /* ------------------------- */
    .eh-loader {
      display: flex;
      justify-content: flex-end;
      padding: 12px 16px;
    }

    .typing-dots {
      display: flex;
      gap: 6px;
    }

    .typing-dots div {
      width: 8px;
      height: 8px;
      background: #9ca3af;
      border-radius: 50%;
      animation: typing 1s infinite ease-in-out;
    }

    .typing-dots div:nth-child(2) { animation-delay: 0.1s; }
    .typing-dots div:nth-child(3) { animation-delay: 0.2s; }

    @keyframes typing {
      0% { transform: translateY(0px); opacity: 0.4; }
      50% { transform: translateY(-4px); opacity: 1; }
      100% { transform: translateY(0px); opacity: 0.4; }
    }

    /* ------------------------- */
    /* INPUT AREA                */
    /* ------------------------- */
    .chat-input-container {
      padding: 16px;
      border-top: 1px solid rgba(0,0,0,0.08);
      background: rgba(255,255,255,0.6);
      backdrop-filter: blur(10px);
    }

    .input-row {
      display: flex;
      gap: 10px;
    }

    .chat-input {
      flex: 1;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid #d1d5db;
      outline: none;
      transition: border-color 0.2s;
    }

    .chat-input:focus {
      border-color: #3b82f6;
    }

    .send-btn {
      background: #111827;
      padding: 12px 20px;
      border-radius: 12px;
      color: white;
      border: none;
      cursor: pointer;
      font-weight: 500;
      transition: 0.2s;
    }

    .send-btn:hover {
      background: #1f2937;
    }

    .powered-by {
      margin-top: 10px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }

    /* MOBILE */
    @media (max-width: 768px) {
      .chat-popup {
        position: fixed;
        width: 100%;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
        bottom: 0;
        right: 0;
      }
    }


    @keyframes swoopIn {
    0% {
      transform: translate(120px, 120px) scale(0.4);
      opacity: 0;
    }
    70% {
      transform: translate(-10px, -10px) scale(1.05);
      opacity: 1;
    }
    100% {
      transform: translate(0, 0) scale(1);
    }
  }

  @keyframes swoopOut {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    40% {
      transform: translate(-10px, -10px) scale(1.05);
    }
    100% {
      transform: translate(120px, 120px) scale(0.4);
      opacity: 0;
    }
  }

  .chat-bubble.swoop-in {
    animation: swoopIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .chat-bubble.swoop-out {
    animation: swoopOut 0.38s cubic-bezier(0.55, 0.06, 0.68, 0.19) forwards;
  }

  .chat-popup.swoop-in {
    animation: swoopIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .chat-popup.swoop-out {
    animation: swoopOut 0.38s cubic-bezier(0.55, 0.06, 0.68, 0.19) forwards;
  }

    </style>
`;

  // Define the HTML structure within shadow DOM
  const shadowHTML = `
    <div class="chat-bubble" id="chat-bubble">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </div>
    <div class="chat-popup hidden" id="chat-popup">
      <div class="chat-header">
        <h3>EduChat Assistant</h3>
        <button class="close-btn" id="close-popup">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="chat-messages" id="chat-messages">
        <div id="welcome-message" class="message-row assistant">
          <div class="message-bubble assistant">
            You are now connected to EduChat Assistant. How can we help you today?
          </div>
        </div>
      </div>
      <div id="eh-loader" class="eh-loader hidden">
        <div class="typing-dots">
          <div></div><div></div><div></div>
        </div>
      </div>
      <div class="chat-input-container">
        <div class="input-row">
          <input type="text" class="chat-input" id="chat-input" placeholder="Type your message...">
          <button class="send-btn" id="chat-submit">Send</button>
        </div>
        <div class="powered-by">
          Powered by <a href="https://edumix.lk" target="_blank">Dialog Edumix</a>
        </div>
      </div>
    </div>
  `;

  // Inject styles and HTML into shadow DOM
  shadowRoot.innerHTML = shadowStyles + shadowHTML;

  // Loader
  const loader = shadowRoot.getElementById("eh-loader");

  function showLoader() {
    loader.classList.remove("hidden");
  }

  function hideLoader() {
    loader.classList.add("hidden");
  }

  // ------------------------------------------------------------------------------------------
  // DOM References
  // ------------------------------------------------------------------------------------------

  const chatInput = shadowRoot.getElementById("chat-input");
  const chatSubmit = shadowRoot.getElementById("chat-submit");
  const chatMessages = shadowRoot.getElementById("chat-messages");
  const chatBubble = shadowRoot.getElementById("chat-bubble");
  const chatPopup = shadowRoot.getElementById("chat-popup");
  const closePopup = shadowRoot.getElementById("close-popup");

  // ------------------------------------------------------------------------------------------
  // Config Extraction
  // ------------------------------------------------------------------------------------------

  const ChatConfig = (() => {
    const params = new URL(import.meta.url).searchParams;
    return {
      tenant: params.get("tenant"),
      tokenId: params.get("tokenId"),
      mobile: params.get("mobile"),
      email: params.get("email"),
      uid: params.get("uid"),
    };
  })();

  // ------------------------------------------------------------------------------------------
  // UI Actions
  // ------------------------------------------------------------------------------------------

  let lastMessageId = 0;
  let isPolling = false;
  let pollingHold = false;
  let chatOpened = false;

  function togglePopup() {
    if (!chatOpened) {
      ChatService.initSession(ChatConfig).then((init) => {
        if (init.status === "success") pollLoop();
      });
    }

    chatOpened = true;

    if (chatPopup.classList.contains("hidden")) {
      chatPopup.classList.remove("hidden");
      chatPopup.classList.remove("swoop-out");
      chatPopup.classList.add("swoop-in");
    } else {
      chatPopup.classList.remove("swoop-in");
      chatPopup.classList.add("swoop-out");

      setTimeout(() => {
        chatPopup.classList.add("hidden");
      }, 350);
    }

    chatInput.focus();
  }

  function appendMessage(sender, text) {
    const row = document.createElement("div");
    row.className = `message-row ${sender}`;
    row.innerHTML = `<div class="message-bubble ${sender}">${text}</div>`;
    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendInteractiveMessage(messageObj) {
    const row = document.createElement("div");
    row.className = "message-row assistant";

    let html = `
        <div class="message-bubble assistant">
            ${messageObj.title}
            <div class="eh-interactive-container" style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
    `;

    messageObj.choices.forEach((choice) => {
      html += `
            <button 
                class="eh-choice-btn" 
                data-id="${choice.id}" 
                data-label="${choice.label}"
                data-next="${choice.next}"
                style="
                    padding: 10px 14px;
                    background: #1f2937;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    text-align: left;
                "
            >
                ${choice.label}
            </button>
        `;
    });

    html += `</div></div>`;
    row.innerHTML = html;

    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // attach click drivers
    row.querySelectorAll(".eh-choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        handleChoiceClick(btn.dataset.id, btn.dataset.label);
      });
    });
  }

  // ------------------------------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------------------------------

  chatSubmit.onclick = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = "";

    await ChatService.sendMessage(ChatConfig, text);
  };

  chatInput.onkeyup = (e) => e.key === "Enter" && chatSubmit.click();

  chatBubble.onclick = togglePopup;
  closePopup.onclick = togglePopup;

  async function handleChoiceClick(choiceId, choiceLabel) {
    await ChatService.sendMessage(ChatConfig, {
      list_reply: {
        id: choiceId,
        title: choiceLabel,
      },
    });
  }

  // ------------------------------------------------------------------------------------------
  // Polling
  // ------------------------------------------------------------------------------------------

  async function pollLoop() {
    if (isPolling || pollingHold) return;
    isPolling = true;

    try {
      const res = await ChatService.poll(lastMessageId, ChatConfig);

      if (res.status == "hold") {
        pollingHold = true;
      }

      const welcomeEl = shadowRoot.getElementById("welcome-message");

      if (res.messages.length === 0 && lastMessageId === 0) {
        welcomeEl.classList.remove("hidden");
      } else {
        welcomeEl.classList.add("hidden");
      }

      res.messages.forEach((m) => {
        if (m.type == "RESPONSE" && m.extra != null) {
          appendInteractiveMessage(m.extra);
        } else if (m.type == "RESPONSE" && !m.agent_id) {
          appendMessage("user", m.message);
        } else if (m.type == "RESPONSE" && m.agent_id) {
          appendMessage("assistant", m.message);
        } else if (m.type != "RESPONSE") {
          appendMessage("notice", m.message);
        }
      });

      lastMessageId = res.last_id;
    } catch (e) {
      console.error("Poll error:", e);
    }

    isPolling = false;
    setTimeout(pollLoop, 2000);
  }

  // ------------------------------------------------------------------------------------------
  // API Layer
  // ------------------------------------------------------------------------------------------

  // const API_BASE = "http://localhost:8001/api/webhook/webChat";
  const API_BASE =
    "https://dev2.databoxtech.io/edumix_support/api/api/webhook/webChat";

  const ChatService = {
    sessionId: sessionStorage.getItem("session_id"),

    async initSession(config) {
      if (this.sessionId)
        return { status: "success", session_id: this.sessionId };

      try {
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...config,
            action: "session",
          }),
        });

        const data = await res.json();
        if (data.status === "success") {
          sessionStorage.setItem("session_id", data.session_id);
          this.sessionId = data.session_id;
          return { status: "success" };
        }

        return { status: "failure", error: "No session id" };
      } catch (err) {
        return { status: "failure", error: err.message };
      }
    },

    async sendMessage(config, text) {
      if (!this.sessionId) {
        const s = await this.initSession(config);
        if (s.status !== "success") return s;
      }

      console.log(text);

      showLoader();

      pollingHold = false;

      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          action: "message",
          session_id: this.sessionId,
          message: text,
        }),
      });

      hideLoader();
      pollLoop();

      return res.json();
    },

    async poll(lastId, config) {
      const res = await fetch(
        `${API_BASE}?session_id=${this.sessionId}&after=${lastId}` +
          `&tenant=${config.tenant}&tokenId=${config.tokenId}`
      );

      return res.json();
    },
  };

  // ------------------------------------------------------------------------------------------
  // Set initialized
  // ------------------------------------------------------------------------------------------

  window.EasyHelp._initialized = true;
  window.EasyHelp._shadowHost = shadowHost;
};

// Auto init
document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", window.EasyHelp.init)
  : window.EasyHelp.init();
