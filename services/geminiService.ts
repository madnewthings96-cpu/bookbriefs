
import { GoogleGenAI, Type } from "@google/genai";
import { SummaryData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateBookSummary = async (title: string, author: string): Promise<SummaryData> => {
  const prompt = `
    Please provide a comprehensive summary and key takeaways for the book "${title}" by ${author}.
    The summary should be detailed, capturing the main plot points, themes, and arguments of the book.
    The key takeaways should be a list of the most important lessons or ideas from the book.
    Provide the output in a structured JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

// Chat function for LLM Chat page
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatWithAI = async (message: string, history: ChatMessage[] = []): Promise<string> => {
  try {
    // Build conversation history
    const conversationHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Add system context as the first message if history is empty
    const systemContext = `You are a knowledgeable AI assistant specializing in trading, investing, books about finance and trading, and personal development. 
    You provide helpful, accurate, and educational responses. You can:
    - Explain trading strategies and concepts
    - Recommend books on trading, investing, and business
    - Summarize key ideas from popular finance and self-help books
    - Provide insights on risk management and trading psychology
    - Answer questions about technical and fundamental analysis
    
    Always provide thoughtful, well-structured responses that help users learn and grow.`;

    const prompt = history.length === 0 
      ? `${systemContext}\n\nUser: ${message}`
      : message;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error in chat:", error);
    throw new Error("Failed to get response from AI. Please try again.");
  }
};
