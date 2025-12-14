// Secure serverless function for Groq AI chat
// Uses Groq's OpenAI-compatible endpoint.

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
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "API key not configured" }),
      };
    }

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

    // Build OpenAI-style messages (Groq compatibility)
    // Prevent sending the current user message twice if it appears as the last history item.
    const cleanedHistory = Array.isArray(history) ? [...history] : [];
    const last = cleanedHistory[cleanedHistory.length - 1];
    if (last && last.role === 'user' && typeof last.content === 'string' && last.content.trim() === message.trim()) {
      cleanedHistory.pop();
    }

    const groqMessages = [
      { role: 'system', content: systemContext },
      ...cleanedHistory
        .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
        messages: groqMessages,
        temperature: 0.4,
        max_tokens: 900,
      }),
    });

    const payload = await groqResponse.json().catch(() => null);

    if (!groqResponse.ok) {
      const details = payload?.error?.message || payload?.message || `HTTP ${groqResponse.status}`;
      const statusCode = groqResponse.status === 429 ? 429 : groqResponse.status === 401 ? 401 : 500;
      return {
        statusCode,
        headers,
        body: JSON.stringify({ error: "Failed to get AI response", details }),
      };
    }

    const text = payload?.choices?.[0]?.message?.content;
    if (!text || typeof text !== 'string') {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Invalid AI response" }),
      };
    }

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
