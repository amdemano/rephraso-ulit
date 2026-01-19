const input = document.getElementById("input");
const chat = document.getElementById("chat");

/* Auto-grow textarea */
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = input.scrollHeight + "px";
});

/* Enter = send | Shift+Enter = new line */
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    rewrite();
  }
});

function scrollToBottom() {
  chat.scrollTop = chat.scrollHeight;
}

async function rewrite() {
  const text = input.value.trim();
  if (!text) return;

  /* 1. Add user message */
  const userTurn = document.createElement("div");
  userTurn.className = "turn user";
  userTurn.innerHTML = `
    <div class="speaker">You</div>
    <div class="message"></div>
  `;
  userTurn.querySelector(".message").textContent = text;
  chat.appendChild(userTurn);

  /* Clear input */
  input.value = "";
  input.style.height = "auto";
  scrollToBottom();

  /* 2. Assistant placeholder */
  const assistantTurn = document.createElement("div");
  assistantTurn.className = "turn assistant";
  assistantTurn.innerHTML = `
    <div class="speaker">Rephraso</div>
    <div class="message">Rewriting…</div>
  `;
  chat.appendChild(assistantTurn);
  scrollToBottom();

  try {
    const response = await fetch("/api/rewrite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();
    console.log("API response:", data);

    /* ✅ Ensure rewrittenText is a string */
    if (typeof data.rewrittenText === "string") {
      const htmlOutput = marked.parse(data.rewrittenText);
      const cleanHtml = DOMPurify.sanitize(htmlOutput);
      assistantTurn.querySelector(".message").innerHTML = cleanHtml;
    } else {
      console.error("Unexpected response shape:", data);
      assistantTurn.querySelector(".message").textContent =
        data?.error || "Sorry, something went wrong.";
    }

  } catch (error) {
    console.error("Fetch error:", error);
    assistantTurn.querySelector(".message").textContent =
      "Connection error. Is the backend running?";
  }

  scrollToBottom();
}
