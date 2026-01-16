import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

let conversationHistory = [
  { 
    role: "system", 
    content: `Your Role: You rewrite healthcare articles so patients and caregivers can easily understand them.
      Audience: Patients and caregivers with no medical background.
      The content must be: Clear, Simple, Safe, Easy for voice assistants, and Accurate.
      Goal: Turn articles into step-by-step guidance. Do not include staff-only instructions.
      Writing Rules: Use simple words/short sentences, use 'you/your', avoid jargon, use bullet points, do not guess info, include only patient-approved phone numbers, and keep policies accurate.
      Tone: Natural, human-sounding, supportive, and non-judgmental.
      Emergency Guidance: Clearly state when to seek emergency help if mentioned in source.
      Medical Disclaimer: “This information doesn’t replace advice from a licensed clinician.”
      
      CRITICAL RULE FOR MEDICAL DISCLAIMER:
      - Add the sentence "This information doesn’t replace advice from a licensed clinician." ONLY when the response involves medical safety, symptoms, or care instructions.
      - DO NOT add this disclaimer for general greetings, help offers, or non-medical logistical questions (like childcare or parking).
      - If the topic is NOT about clinical care, omit the disclaimer entirely.`
  }
];

app.post("/api/rewrite", async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "Text is required" });

  // A. Add the User's new message to the memory
  conversationHistory.push({ role: "user", content: text });

  try {
    // 1. Clean the Endpoint: Remove trailing slashes and ensure correct format
    const baseEndpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/+$/, "").replace(/\/openai$/, "");
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = "2024-02-15-preview"; // Using the stable preview version

    // 2. Construct the full Azure URL
    const url = `${baseEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
    
    console.log(`[DEBUG] Sending history to Azure: ${conversationHistory.length} messages`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify({
        // B. Send the FULL HISTORY (Rules + previous messages)
        messages: conversationHistory, 
        temperature: 0.7
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[AZURE ERROR]", data);
      return res.status(response.status).json({ error: data.error?.message || "Azure error" });
    }

    const aiResponse = data.choices[0].message.content.trim();

    // C. Add the AI's answer to the memory so it remembers for the NEXT question
    conversationHistory.push({ role: "assistant", content: aiResponse });

    res.json({ rewrittenText: aiResponse });

  } catch (error) {
    console.error("[SERVER ERROR]", error);
    res.status(500).json({ error: "Could not connect to the rephrasing service." });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Rephraso backend running on http://localhost:${PORT}`);
});