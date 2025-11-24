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
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        .hidden {
            display: none !important;
        }
        
        .chat-bubble {
            width: 64px;
            height: 64px;
            background-color: #1f2937;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: transform 0.2s ease;
        }
        
        .chat-bubble:hover {
            transform: scale(1.05);
        }
        
        .chat-bubble svg {
            width: 40px;
            height: 40px;
            color: white;
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
        }
        
        .chat-popup {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 384px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border: 1px solid #e5e7eb;
            display: flex;
            flex-direction: column;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            font-size: 14px;
            height: 70vh;
            max-height: 70vh;
            transition: all 0.3s ease;
            overflow: hidden;
        }
        
        .chat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background-color: #1f2937;
            color: white;
            border-radius: 12px 12px 0 0;
        }
        
        .chat-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }
        
        .close-btn {
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .close-btn:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        .close-btn svg {
            width: 24px;
            height: 24px;
            stroke: currentColor;
            stroke-width: 2;
        }
        
        .chat-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background: #f9fafb;
        }
        
        .chat-input-container {
            padding: 16px;
            border-top: 1px solid #e5e7eb;
            background: white;
            border-radius: 0 0 12px 12px;
        }
        
        .input-row {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        
        .chat-input {
            flex: 1;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 12px 16px;
            outline: none;
            font-size: 14px;
            font-family: inherit;
        }
        
        .chat-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
        }
        
        .send-btn {
            background-color: #1f2937;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        
        .send-btn:hover {
            background-color: #374151;
        }
        
        .powered-by {
            text-align: center;
            font-size: 12px;
            margin-top: 12px;
            color: #6b7280;
        }
        
        .powered-by a {
            color: #3b82f6;
            text-decoration: none;
        }
        
        .message-row {
            display: flex;
            margin-bottom: 12px;
        }
        
        .message-row.user {
            justify-content: flex-end;
        }
          
        .message-row.notice {
            justify-content: center;
        }
        
        .message-bubble {
            max-width: 70%;
            padding: 8px 16px;
            border-radius: 12px;
            line-height: 1.4;
        }
        
        .message-bubble.user {
            background-color: #1f2937;
            color: white;
        }
        
        .message-bubble.assistant {
            background-color: #e5e7eb;
            color: #1f2937;
        }
        
        .message-bubble.notice {
            background-color: transparent;
            color: #6b7280;
            font-style: italic;
        }

        .eh-loader {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.85);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          z-index: 1000;
        }

        .eh-loader.hidden {
          display: none;
        }

        .eh-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #d3d3d3;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 8px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
            .chat-popup {
                position: fixed;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 100%;
                max-height: 100%;
                border-radius: 0;
            }
            
            .chat-header {
                border-radius: 0;
            }
            
            .chat-input-container {
                border-radius: 0;
            }
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
      <div id="eh-loader" class="eh-loader hidden">
        <div class="eh-spinner"></div>
        <p>Loading...</p>
      </div>
      <div class="chat-messages" id="chat-messages">
        <div id="welcome-message" class="message-row assistant">
          <div class="message-bubble assistant">
            You are now connected to EduChat Assistant. How can we help you today?
          </div>
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
    };
  })();

  // ------------------------------------------------------------------------------------------
  // UI Actions
  // ------------------------------------------------------------------------------------------

  let lastMessageId = 0;
  let isPolling = false;
  let pollingHold = false;
  let chatOpened = false;

  async function togglePopup() {
    if (!chatOpened) {
      const init = await ChatService.initSession(ChatConfig);
      if (init.status !== "success") {
        console.error("Session init failed:", init.error);
        return;
      }
      await pollLoop();
    }

    chatOpened = true;
    chatPopup.classList.toggle("hidden");
    if (!chatPopup.classList.contains("hidden")) chatInput.focus();
  }

  function appendMessage(sender, text) {
    const row = document.createElement("div");
    row.className = `message-row ${sender}`;
    row.innerHTML = `<div class="message-bubble ${sender}">${text}</div>`;
    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
        if (m.type == "RESPONSE" && !m.agent_id) {
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
