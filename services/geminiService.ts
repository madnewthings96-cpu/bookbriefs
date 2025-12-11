
import { GoogleGenAI, Type } from "@google/genai";
import { SummaryData } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateBookSummary = async (title: string, author: string): Promise<SummaryData> => {
  const prompt = `
    Please provide a comprehensive summary and key takeaways for the book "${title}" by ${author}.
    The summary should be detailed, capturing the main plot points, themes, and arguments of the book.
    The key takeaways should be a list of the most important lessons or ideas from the book.
    Provide the output in a structured JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A detailed summary of the book.",
            },
            keyTakeaways: {
              type: Type.ARRAY,
              description: "A list of key takeaways from the book.",
              items: {
                type: Type.STRING,
              },
            },
          },
          required: ["summary", "keyTakeaways"],
        },
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);

    if (data && typeof data.summary === 'string' && Array.isArray(data.keyTakeaways)) {
       return data as SummaryData;
    } else {
        throw new Error("Invalid data structure received from API.");
    }

  } catch (error) {
    console.error("Error generating book summary:", error);
    throw new Error("Failed to generate summary. Please check the console for more details.");
  }
};

// Chat function for LLM Chat page - Uses secure serverless function
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatWithAI = async (message: string, history: ChatMessage[] = []): Promise<string> => {
  try {
    // Call secure serverless function (API key is server-side only)
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error types from serverless function
      if (response.status === 429) {
        throw new Error("API quota exceeded. Please try again later or check your API plan.");
      }
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your configuration.");
      }
      throw new Error(data.error || "Failed to get response from AI.");
    }

    return data.response.trim();
  } catch (error: any) {
    console.error("Error in chat:", error);
    
    // Re-throw if it's already a formatted error
    if (error.message && !error.message.includes('fetch')) {
      throw error;
    }
    
    throw new Error("Failed to get response from AI. Please try again.");
  }
};
