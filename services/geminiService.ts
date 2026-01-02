
import { GoogleGenAI, Type } from "@google/genai";
import { Message, Suggestion } from "../types";

/**
 * Generates AI reply suggestions based on the last few messages in a conversation.
 * Strictly follows Google GenAI SDK guidelines for API key usage and model configuration.
 */
export const generateSuggestions = async (
  messages: Message[]
): Promise<Suggestion[]> => {
  // CRITICAL: Always obtain the API key exclusively from process.env.API_KEY
  // Create a new instance right before making an API call to ensure it uses the latest environment state.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const context = messages
    .slice(-3)
    .map((m) => `${m.sender === 'user' ? 'Me' : 'Them'}: ${m.content}`)
    .join('\n');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 distinct reply suggestions based on this conversation history. 
      Provide exactly one for each tone: Professional, Friendly, and Casual.
      
      Conversation:
      ${context}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              tone: { type: Type.STRING, description: 'The tone of the suggestion' },
              text: { type: Type.STRING, description: 'The suggested reply text' },
            },
            required: ['tone', 'text'],
          },
        },
      },
    });

    // Access the .text property directly as per latest SDK guidelines
    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return [];
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
