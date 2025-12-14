// Secure serverless function for Gemini AI chat
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API_KEY_MISSING");

    const { message, history = [] } = JSON.parse(event.body);

    if (!message) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Message is required" }) };
    }

    // 1. DEFINE SYSTEM CONTEXT (Your Persona)
    const systemContext = `You are a knowledgeable AI assistant specializing in trading, investing, books about finance and trading, and personal development. 
    You provide helpful, accurate, and educational responses. You can:
    - Explain trading strategies and concepts
    - Recommend books on trading, investing, and business
    - Summarize key ideas from popular finance and self-help books
    
    Style guidelines:
    - Use a few relevant emojis subtly (1-3 per response)
    - Place emojis naturally next to relevant concepts (📈, 📚, 💡, ⚠️, ✅)
    - Keep it professional.`;

    // 2. INITIALIZE MODEL with System Instruction & Safety Settings
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-lite", // Fast and cost-effective
      systemInstruction: systemContext,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }, // Critical for Finance
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      ]
    });

    // 3. PREPARE HISTORY (The Crash Fix)
    // We convert the history to Gemini format.
    // CRITICAL: We remove the LAST message from 'history' if it matches the current 'message'.
    // This prevents sending the User message twice (once in history, once in sendMessage).
    let pastHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // If the frontend sent the new message inside 'history', remove it so we don't duplicate it.
    if (pastHistory.length > 0 && pastHistory[pastHistory.length - 1].role === 'user') {
       // Simple check: assuming the last user message in history is the current one
       pastHistory.pop(); 
    }

    // 4. START CHAT
    const chat = model.startChat({
      history: pastHistory,
    });

    // 5. SEND MESSAGE
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: text }),
    };

  } catch (error) {
    console.error("Chat Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Processing failed", details: error.message }),
    };
  }
};
