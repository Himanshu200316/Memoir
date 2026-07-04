// Google Gemini API helper
// Requires GEMINI_API_KEY environment variable

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
  }[];
}

export class GeminiApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "GeminiApiError";
    this.status = status;
  }
}

export async function sendToGeminiAPI(
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents,
      systemInstruction: {
        parts: [
          {
            text:
              systemPrompt ||
              "You are a helpful, empathetic health assistant for the Memoir health app. Provide clear, warm, and medically-aware responses. Always recommend consulting a healthcare professional for medical decisions.",
          },
        ],
      },
      generationConfig: {
        maxOutputTokens: 1024,
        // Gemini 2.5 Flash spends part of maxOutputTokens on hidden "thinking"
        // before writing the visible answer — that budget is unpredictable and
        // can eat most of the 1024 tokens, truncating the reply mid-sentence.
        // This is a short-form assistant, not a reasoning task, so disable it.
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 429) {
      throw new GeminiApiError(
        "The AI service has hit its usage quota (Gemini free-tier limit). Please try again later, or upgrade the API plan.",
        429
      );
    }
    throw new GeminiApiError(`Gemini API error (${response.status}): ${err}`, response.status);
  }

  const data: GeminiResponse = await response.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "I'm sorry, I couldn't generate a response."
  );
}
