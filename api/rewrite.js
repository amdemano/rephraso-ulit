import fetch from "node-fetch";

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

export async function handler(request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400 }
      );
    }

    conversationHistory.push({ role: "user", content: text });

    const baseEndpoint = process.env.AZURE_OPENAI_ENDPOINT
      .replace(/\/+$/, "")
      .replace(/\/openai$/, "");

    const url = `${baseEndpoint}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_API_KEY
      },
      body: JSON.stringify({
        messages: conversationHistory,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify(data), { status: response.status });
    }

    const aiResponse = data.choices[0].message.content.trim();
    conversationHistory.push({ role: "assistant", content: aiResponse });

    return new Response(
      JSON.stringify({ rewrittenText: aiResponse }),
      { status: 200 }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Could not connect to the rephrasing service." }),
      { status: 500 }
    );
  }
}