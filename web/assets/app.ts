import { lennyIntro } from "./lenny-anim";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function collectMeta() {
  return {
    sellingAddress: (document.querySelector("#selling-address") as HTMLElement)?.textContent || "",
    buyingAddress: (document.querySelector("#buying-address") as HTMLElement)?.textContent || "",
    salePrice: (document.querySelector<HTMLInputElement>("#sale-price-input")?.value || "").trim(),
    targetPrice: (document.querySelector<HTMLInputElement>("#target-price-input")?.value || "").trim(),
    scenario: document.querySelector("[data-active-scenario]")?.getAttribute("data-active-scenario") || "Likely"
  };
}

function ensureChatPanel() {
  if (document.querySelector("#lenny-chat-panel")) return;
  const panel = document.createElement("div");
  panel.id = "lenny-chat-panel";
  panel.className = "fixed bottom-4 right-4 z-30 w-[min(92vw,380px)] bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col overflow-hidden";
  panel.innerHTML = `
    <div class="px-3 py-2 bg-[#4A5C6A] text-white text-sm font-semibold flex items-center justify-between">
      <span>Chat with Lenny</span>
      <button id="close-lenny-chat" class="text-white/80 hover:text-white">✕</button>
    </div>
    <div id="lenny-chat-messages" class="p-3 space-y-2 overflow-y-auto" style="max-height: 40vh;"></div>
    <div class="p-3 border-t border-gray-200 flex items-center gap-2">
      <input id="lenny-chat-input" class="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5C6A]" placeholder="Ask Lenny anything..." />
      <button id="lenny-chat-send" class="btn-primary px-3 py-2 rounded-md text-sm">Send</button>
    </div>`;
  document.body.appendChild(panel);
  panel.querySelector("#close-lenny-chat")?.addEventListener("click", () => panel.classList.add("hidden"));
}

function appendChat(sender: "You" | "Lenny", text: string) {
  const messages = document.querySelector("#lenny-chat-messages");
  if (!messages) return;
  const row = document.createElement("div");
  const mine = sender === "You";
  row.className = `text-sm ${mine ? "text-right" : "text-left"}`;
  row.innerHTML = `<span class="inline-block ${mine ? "bg-[#4A5C6A] text-white" : "bg-gray-100 text-[#3D3B38]"} px-3 py-2 rounded-lg max-w-[80%]">${text}</span>`;
  messages.appendChild(row);
  (messages as HTMLElement).scrollTop = (messages as HTMLElement).scrollHeight;
}

async function sendStreaming(messages: ChatMessage[], meta: any, onDelta: (chunk: string) => void) {
  const resp = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, meta })
  });
  if (!resp.body) throw new Error("No stream");
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\n/);
    buffer = lines.pop() || "";
    for (const line of lines) {
      const m = line.match(/^data:\s*(.*)$/);
      if (!m) continue;
      const data = m[1];
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) onDelta(delta);
      } catch {}
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const startScenario = (mode: string) => {
    document.querySelector("#overview-view")?.scrollIntoView({ behavior: "smooth" });
    document.body.setAttribute("data-active-scenario", mode);
  };
  lennyIntro(startScenario);

  const chatBtn = document.querySelector("#open-lenny-chat");
  let history: ChatMessage[] = [];
  chatBtn?.addEventListener("click", () => {
    ensureChatPanel();
    const panel = document.querySelector("#lenny-chat-panel");
    panel?.classList.remove("hidden");
    const input = document.querySelector<HTMLInputElement>("#lenny-chat-input");
    const sendBtn = document.querySelector("#lenny-chat-send");
    if (!input || !sendBtn) return;
    if (!(sendBtn as any)._bound) {
      (sendBtn as any)._bound = true;
      const doSend = async () => {
        if (!input.value.trim()) return;
        const userText = input.value.trim();
        input.value = "";
        appendChat("You", userText);
        history.push({ role: "user", content: userText });
        let acc = "";
        appendChat("Lenny", "");
        const lastBubble = (document.querySelectorAll("#lenny-chat-messages div") as any)[(document.querySelectorAll("#lenny-chat-messages div") as any).length - 1] as HTMLElement;
        const bubble = lastBubble?.querySelector("span") as HTMLElement;
        try {
          await sendStreaming(history, collectMeta(), (chunk) => {
            acc += chunk;
            if (bubble) bubble.textContent = acc;
          });
          history.push({ role: "assistant", content: acc });
        } catch (e) {
          if (bubble) bubble.textContent = "Sorry, the chat is unavailable right now.";
        }
      };
      sendBtn.addEventListener("click", doSend);
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") doSend(); });
    }
  });
});



