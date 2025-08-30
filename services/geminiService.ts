
import { GoogleGenAI, Type } from "@google/genai";
import { LearningStyle, SessionData, QuizQuestion, ChatMessage, CornellNotes } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getTutorPersona = (style: LearningStyle) => {
  let persona = `You are 'Lumi', a friendly, patient, and encouraging AI Learning Companion. Your primary goal is to help users, especially those who are neurodiverse, understand complex topics. You break down information into simple, manageable steps. You never judge mistakes and always reframe them as learning opportunities. Your communication style is clear, positive, and supportive.`;

  switch(style) {
    case LearningStyle.VISUAL:
      persona += ` You excel at creating visual analogies, describing diagrams, and structuring information in a way that is easy to visualize, like using mind maps in text format.`;
      break;
    case LearningStyle.FEYNMAN:
      persona += ` You are an expert at using the Feynman technique. You explain everything in the simplest possible terms, using analogies and avoiding jargon.`;
      break;
    case LearningStyle.CORNELL_NOTES:
      persona += ` You are a master of organization and structure, helping the user create and understand notes in the Cornell Notes format.`;
      break;
    case LearningStyle.SQ3R:
      persona += ` You guide the user through the SQ3R (Survey, Question, Read, Recite, Review) method, helping them to actively engage with the material.`;
      break;
  }
  return persona;
};

export const analyzeContent = async (content: string, style: LearningStyle): Promise<Omit<SessionData, 'originalContent'>> => {
  const model = 'gemini-2.5-flash';
  const persona = getTutorPersona(style);

  const response = await ai.models.generateContent({
    model,
    contents: `Based on the following content, please act as the user's learning companion and prepare their initial learning session.
    Content:
    ---
    ${content}
    ---
    `,
    config: {
      systemInstruction: persona,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: 'A brief, simple overview of the content, tailored to the learning style.' },
          outline: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A bulleted or numbered list of key topics.' },
          keyQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of 3 thought-provoking questions to start the discussion.' },
        }
      }
    }
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as Omit<SessionData, 'originalContent'>;
};

export const getLearningStyleFromQuiz = async (answers: string[]): Promise<LearningStyle> => {
    const model = 'gemini-2.5-flash';
    const prompt = `A user has answered a quiz to determine their learning style. Based on these answers, which of the following learning styles do they most align with? The options are: Visual, Feynman, Cornell Notes, SQ3R Method.
    
    Answers:
    1. ${answers[0]}
    2. ${answers[1]}
    3. ${answers[2]}
    4. ${answers[3]}
    
    Respond with only the name of the learning style (e.g., "Visual").`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt
    });
    
    const style = response.text.trim();

    // Ensure the response is a valid learning style
    if (Object.values(LearningStyle).includes(style as LearningStyle)) {
        return style as LearningStyle;
    }
    // Default fallback
    return LearningStyle.FEYNMAN;
};

export const generateQuiz = async (content: string, style: LearningStyle): Promise<QuizQuestion[]> => {
    const model = 'gemini-2.5-flash';
    const persona = getTutorPersona(style);

    const response = await ai.models.generateContent({
        model,
        contents: `Based on the provided content, generate a 5-question multiple-choice quiz. The questions should test understanding of the key concepts.
        Content:
        ---
        ${content}
        ---
        `,
        config: {
            systemInstruction: persona,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                        explanation: { type: Type.STRING, description: 'A brief, encouraging explanation of the correct answer.'}
                    }
                }
            }
        }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as QuizQuestion[];
};

export const generateCornellNotes = async (content: string, chatHistory: ChatMessage[]): Promise<CornellNotes> => {
    const model = 'gemini-2.5-flash';
    const persona = getTutorPersona(LearningStyle.CORNELL_NOTES);
    const chatTranscript = chatHistory.map(msg => `${msg.sender}: ${msg.text}`).join('\n');

    const response = await ai.models.generateContent({
        model,
        contents: `Create a set of Cornell Notes based on the original content and our conversation.
        Original Content:
        ---
        ${content}
        ---
        Conversation History:
        ---
        ${chatTranscript}
        ---
        Please structure the notes into main notes, cues, and a summary.
        `,
        config: {
            systemInstruction: persona,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    mainNotes: { type: Type.STRING, description: 'Detailed notes from the content and conversation.' },
                    cues: { type: Type.STRING, description: 'Keywords and questions to jog memory, listed line by line.' },
                    summary: { type: Type.STRING, description: 'A one or two-sentence summary of the material covered.' },
                }
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as CornellNotes;
};

export const streamChatResponse = async (
    originalContent: string, 
    chatHistory: ChatMessage[], 
    style: LearningStyle, 
    onChunk: (text: string) => void
) => {
    const model = 'gemini-2.5-flash';
    const persona = getTutorPersona(style);
    
    const contents = `You are continuing a conversation with a user about the following content. Keep your answers concise and tailored to their learning style.
    Original Content Summary:
    ---
    ${originalContent.substring(0, 1500)}...
    ---
    
    Conversation History:
    ${chatHistory.slice(-6).map(m => `${m.sender}: ${m.text}`).join('\n')}
    `;

    const stream = await ai.models.generateContentStream({
        model,
        contents: contents,
        config: { systemInstruction: persona }
    });

    for await (const chunk of stream) {
        onChunk(chunk.text);
    }
};
