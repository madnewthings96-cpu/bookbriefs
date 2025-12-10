// Secure serverless function for Gemini AI chat
// API key is stored securely in Netlify environment variables

const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Get API key from server-side environment variable (secure)
    const apiKey = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("GEMINI_API_KEY_2 not configured");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "API key not configured" }),
      };
    }

    // Parse request body
    const { message, history = [] } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Message is required" }),
      };
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // System context for the AI
    const systemContext = `You are a knowledgeable AI assistant specializing in trading, investing, books about finance and trading, and personal development. 
    You provide helpful, accurate, and educational responses. You can:
    - Explain trading strategies and concepts
    - Recommend books on trading, investing, and business
    - Summarize key ideas from popular finance and self-help books
    - Provide insights on risk management and trading psychology
    - Answer questions about technical and fundamental analysis
    
    Style guidelines:
    - Use a few relevant emojis subtly throughout your responses to make them engaging (1-3 emojis per response)
    - Place emojis naturally next to relevant concepts (e.g., 📈 for growth, 📚 for books, 💡 for ideas, ⚠️ for warnings, ✅ for tips)
    - Don't overuse emojis - keep them professional and purposeful
    
    Always provide thoughtful, well-structured responses that help users learn and grow.`;

    // Build conversation history for Gemini format
    const chatHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory.length > 0 ? chatHistory : undefined,
    });

    // Prepare the prompt
    const prompt = history.length === 0 
      ? `${systemContext}\n\nUser: ${message}`
      : message;

    // Send message and get response
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: text }),
    };

  } catch (error) {
    console.error("Chat function error:", error);
    
    // Handle specific error types
    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ error: "API quota exceeded. Please try again later." }),
      };
    }
    
    if (error.message?.includes('401') || error.message?.includes('API_KEY')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid API key configuration." }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to get AI response. Please try again." }),
    };
  }
};
