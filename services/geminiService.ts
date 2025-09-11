
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
