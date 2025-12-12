import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Message, SealData, Sender } from "./types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper for exponential backoff retry
async function withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Check for 429 (Resource Exhausted) or 503 (Service Unavailable)
    const isRateLimit = error.status === 429 || error.code === 429 || 
                        (error.message && error.message.includes('429')) ||
                        (error.message && error.message.includes('RESOURCE_EXHAUSTED'));
                        
    if (isRateLimit && retries > 0) {
      console.warn(`Rate limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Helper to sanitize chat history for the API
const formatHistory = (messages: Message[]) => {
  return messages.map(m => {
    const parts: any[] = [];
    
    if (m.media) {
      try {
        const [header, base64Data] = m.media.split(',');
        // header example: "data:image/png;base64" or "data:audio/mp3;base64"
        const mimeType = header.split(':')[1].split(';')[0];
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      } catch (e) {
        console.error("Error formatting media", e);
      }
    }

    if (m.text) {
      parts.push({ text: m.text });
    }

    // Safety fallback for empty messages to prevent API error
    if (parts.length === 0) {
        parts.push({ text: "..." });
    }

    return {
      role: m.sender === Sender.USER ? 'user' : 'model',
      parts
    };
  });
};

/**
 * Initializes the chat based on the user's first input (text + optional media).
 */
export const startDiagnosisChat = async (userText: string, userMedia?: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const systemInstruction = `
You are "Essence", a cognitive minimalist assistant.
Your goal is to help the user internalize ONE piece of information today.

CRITICAL RULES:
1. **Language Detection**: Detect the language of the user's input. YOU MUST REPLY IN THE EXACT SAME LANGUAGE.
2. **Phase 1: Diagnosis**: Analyze the input (text, image, audio, or video). Do NOT summarize it yet.
3. **Interaction**: Don't just ask a question. First, give a brief, warm validation or an intriguing observation about their input. THEN, ask a question to diagnose their INTENT.

Diagnose if the intent is:
- Emotion/Memory (Cherishing a story/moment)
- Cognition/Learning (Deep study of lecture/content)
- Organization/Archiving (Building a structure)

Tone: Minimalist, intelligent, empathetic.
    `;

    const parts: any[] = [];
    if (userMedia) {
        const [header, base64Data] = userMedia.split(',');
        const mimeType = header.split(':')[1].split(';')[0];
        parts.push({ inlineData: { mimeType, data: base64Data } });
    }
    if (userText) {
        parts.push({ text: userText });
    }
    // If both empty (edge case), add placeholder
    if (parts.length === 0) parts.push({ text: "..." });

    return await withRetry(async () => {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts }],
          config: {
            systemInstruction,
          }
        });
        return response.text || "I see. What draws you to this specific thought today?";
    });

  } catch (error) {
    console.error("Diagnosis Error:", error);
    const err = error as any;
    if (err.status === 429 || (err.message && err.message.includes('RESOURCE_EXHAUSTED'))) {
         return "The spirits are overwhelmed (System busy). Please wait a moment and try again.";
    }
    return "I am listening. Could you tell me more about why this matters to you?";
  }
};

/**
 * Continues the conversation. 
 */
export const sendMessage = async (history: Message[], newText: string, newMedia?: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const parts: any[] = [];
    if (newMedia) {
        const [header, base64Data] = newMedia.split(',');
        const mimeType = header.split(':')[1].split(';')[0];
        parts.push({ inlineData: { mimeType, data: base64Data } });
    }
    if (newText) {
        parts.push({ text: newText });
    }

    const contents = [
      ...formatHistory(history),
      { role: 'user', parts }
    ];

    const systemInstruction = `
You are "Essence".
You are currently in a dialogue with the user.

CRITICAL RULES:
1. **Language**: ALWAYS reply in the same language the user is currently using.
2. **Persona**: 
   - If they want to Remember: Be a listener. Focus on empathy and narrative.
   - If they want to Learn: Be Socrates. Challenge them, offer a new perspective, or ask "why".
   - If they want to Organize: Be an Architect. Look for patterns, suggest a structure.
3. **Interaction**: Do NOT just ask questions. You are a conversation partner. 
   - **Offer feedback**: "That is a profound observation..." 
   - **Give perspective**: "From another angle, this could mean..."
   - **Inspire**: "This reminds me of the concept of..."
   - Only then, ask a follow-up to deepen the thought.
4. **Brevity**: Keep responses under 60 words. Quality over quantity.
    `;

    return await withRetry(async () => {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: { systemInstruction }
        });
        return response.text || "...";
    });

  } catch (error) {
    console.error("Chat Error:", error);
    const err = error as any;
    if (err.status === 429 || (err.message && err.message.includes('RESOURCE_EXHAUSTED'))) {
         return "I need a moment of silence to process (Quota limit). Please try again shortly.";
    }
    return "I am reflecting on that...";
  }
};

/**
 * Generates the "Seal" - the final crystallized wisdom.
 */
export const generateSealData = async (messages: Message[]): Promise<Omit<SealData, 'id' | 'timestamp'>> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Provide the whole conversation context
    const conversationText = messages.map(m => `${m.sender}: ${m.text} ${m.media ? '[Media Uploaded]' : ''}`).join('\n');
    
    const prompt = `
      The conversation below represents a "distillation" process of information into wisdom.
      
      CONVERSATION:
      ${conversationText}
      
      TASK:
      Crystallize this interaction into a "Seal of Wisdom".
      
      CRITICAL: The 'title', 'essence', and 'actionPrinciple' MUST BE IN THE SAME LANGUAGE AS THE CONVERSATION.

      I need a JSON response with:
      1. "title": A poetic, short title (max 5 words).
      2. "essence": The core insight in one elegant sentence.
      3. "actionPrinciple": A concrete, actionable rule or takeaway (Start with a verb).
      4. "visualPrompt": A highly artistic, abstract description for an image generator to create a "Totem" representing this wisdom. Minimalist, symbolic, zen style. (Always in English).
      5. "category": Choose one based on the conversation content: 'Emotion', 'Cognition', 'Organization', or 'Wisdom'.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        essence: { type: Type.STRING },
        actionPrinciple: { type: Type.STRING },
        visualPrompt: { type: Type.STRING },
        category: { type: Type.STRING, enum: ['Emotion', 'Cognition', 'Organization', 'Wisdom'] },
      },
      required: ["title", "essence", "actionPrinciple", "visualPrompt", "category"],
    };

    const resultText = await withRetry(async () => {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
          }
        });
        return response.text || "{}";
    });

    let jsonText = resultText;
    
    // Improved JSON extraction
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }

    const data = JSON.parse(jsonText);
    return data;

  } catch (error) {
    console.error("Seal Generation Error:", error);
    // Fallback data to prevent app crash
    const err = error as any;
    let essenceMsg = "In silence, we find the answers we couldn't hear in the noise.";
    
    if (err.status === 429 || (err.message && err.message.includes('RESOURCE_EXHAUSTED'))) {
        essenceMsg = "The stream is currently full (Quota Exceeded). Please try to crystallize again later.";
    }

    return {
      title: "Silence",
      essence: essenceMsg,
      actionPrinciple: "Pause before you consume.",
      visualPrompt: "A single white stone on a dark surface, minimalist photography",
      category: "Wisdom"
    };
  }
};

/**
 * Generates the visual totem image.
 */
export const generateTotemImage = async (visualPrompt: string): Promise<string | undefined> => {
  try {
    const model = 'gemini-2.5-flash-image'; 
    
    return await withRetry(async () => {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [{ text: `A minimalist, zen, high-quality artistic abstract symbol. ${visualPrompt}` }]
          },
        });

        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
        return undefined;
    });
  } catch (error) {
    console.error("Image Gen Error:", error);
    // Return undefined safely, UI handles missing image
    return undefined;
  }
};
