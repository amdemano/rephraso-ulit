async function rewrite() {
  const input = document.getElementById("input");
  const chat = document.getElementById("chat");
  const text = input.value.trim();

  if (!text) return;

  // 1. Add User message to the chat
  const userTurn = document.createElement("div");
  userTurn.className = "turn user";
  userTurn.innerHTML = `
    <div class="speaker">You</div>
    <div class="message">${text}</div>
  `;
  chat.appendChild(userTurn);

  input.value = ""; // Clear input immediately for better UX

  // 2. Add Assistant placeholder
  const assistantTurn = document.createElement("div");
  assistantTurn.className = "turn assistant";
  assistantTurn.innerHTML = `
    <div class="speaker">Rephraso</div>
    <div class="message">Rewriting…</div>
  `;
  chat.appendChild(assistantTurn);

  try {
    const response = await fetch("/api/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        text: text, 
        tone: "professional" 
      }),
    });

    const data = await response.json();

    if (data.rewrittenText) {
      const rawText = data.rewrittenText;
      
      // NEW: Convert Markdown to HTML then Sanitize for Security
      const htmlOutput = marked.parse(rawText); //
      const cleanHtml = DOMPurify.sanitize(htmlOutput); //
      
      assistantTurn.querySelector(".message").innerHTML = cleanHtml; //
    } else {
      assistantTurn.querySelector(".message").textContent = data.error || "Sorry, I couldn't process that.";
    }
  } catch (error) {
    console.error("Fetch error:", error);
    assistantTurn.querySelector(".message").textContent = "Connection error. Is the backend running?";
  }

  // 3. Auto-scroll to show new messages
  chat.scrollTop = chat.scrollHeight;
}

// Function to force the scroll to the bottom
function scrollToBottom() {
  const chatContainer = document.getElementById("chat");
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function rewrite() {
  const input = document.getElementById("input");
  const chat = document.getElementById("chat");
  const text = input.value.trim();

  if (!text) return;

  // 1. Add User message to the chat
  const userTurn = document.createElement("div");
  userTurn.className = "turn user";
  userTurn.innerHTML = `
    <div class="speaker">You</div>
    <div class="message">${text}</div>
  `;
  chat.appendChild(userTurn);
  
  // Clear input immediately and scroll down
  input.value = ""; 
  scrollToBottom();

  // 2. Add Assistant placeholder
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text }),
    });

    const data = await response.json();

    if (data.rewrittenText) {
      const rawText = data.rewrittenText;
      
      // Convert Markdown to HTML then Sanitize for Security
      const htmlOutput = marked.parse(rawText);
      const cleanHtml = DOMPurify.sanitize(htmlOutput);
      
      assistantTurn.querySelector(".message").innerHTML = cleanHtml;
      scrollToBottom();
    } else {
      assistantTurn.querySelector(".message").textContent = data.error || "Sorry, I couldn't process that.";
    }
  } catch (error) {
    console.error("Fetch error:", error);
    assistantTurn.querySelector(".message").textContent = "Connection error. Is the backend running?";
  }
}

// 3. Robust "Enter" Key Support
document.getElementById("input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevents page reload or new lines
    rewrite();
  }
});