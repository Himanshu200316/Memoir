import { NextRequest, NextResponse } from "next/server";
import { sendToGeminiAPI, GeminiApiError } from "@/lib/gemini";
import { queryHealthMemory, storeHealthEvent } from "@/lib/cognee";

// Default user ID — replace with real auth session userId when auth is wired up
const DEFAULT_USER_ID = "himanshu_default";

export async function POST(request: NextRequest) {
  try {
    const { messages, healthContext, userId } = await request.json();
    const effectiveUserId = userId || DEFAULT_USER_ID;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Extract the latest user message for memory querying
    const latestUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content || "";

    // ── Cognee: Retrieve relevant memory context ──────────────────────────────
    const memoryContext = latestUserMessage
      ? await queryHealthMemory(effectiveUserId, latestUserMessage)
      : "";

    // ── Build system prompt: static context + Cognee memory ──────────────────
    const systemPrompt = `You are Memoir AI, a warm and empathetic health assistant. You help users understand their health data, answer questions about medications, provide wellness tips, and support their health journey.

${healthContext ? `Here is the user's CURRENT health profile, taken live from what they have entered in the app right now. Treat this as the single source of truth for their present medications, symptoms, and stats:\n${healthContext}` : "The user has not entered any health profile data into the app yet."}

${memoryContext ? `Here is supplementary context from past conversations, retrieved from the user's memory graph. This may be OUTDATED or refer to things that have since changed — never state something from here as a current fact (e.g. a medication they are "on") unless it also appears in the CURRENT health profile above. If it conflicts with the current profile, the current profile wins:\n${memoryContext}` : ""}

Guidelines:
- Be warm, encouraging, and empathetic
- Provide actionable health advice when appropriate
- Always recommend consulting a healthcare professional for medical decisions
- Only describe the user's current medications/symptoms/stats using the CURRENT health profile section — do not invent or carry over details from memory that aren't confirmed there
- Keep responses concise but thorough`;

    const response = await sendToGeminiAPI(messages, systemPrompt);

    // ── Cognee: Store this conversation turn in memory ────────────────────────
    // Fire-and-forget — don't block the response
    storeHealthEvent(effectiveUserId, "chat_turn", {
      userMessage: latestUserMessage,
      assistantResponse: response,
      timestamp: new Date().toISOString(),
    }).catch((err) => console.error("[Cognee] Failed to store chat turn:", err));

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    if (error instanceof GeminiApiError && error.status === 429) {
      return NextResponse.json(
        { error: "quota_exceeded", message: error.message },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
