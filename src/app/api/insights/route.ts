import { NextRequest, NextResponse } from "next/server";
import { sendToGeminiAPI, GeminiApiError } from "@/lib/gemini";
import { storeHealthEvent, queryHealthMemory } from "@/lib/cognee";

// Default user ID — replace with real auth session userId when auth is wired up
const DEFAULT_USER_ID = "himanshu_default";

export async function POST(request: NextRequest) {
  try {
    const { healthData, userId } = await request.json();
    const effectiveUserId = userId || DEFAULT_USER_ID;

    if (!healthData) {
      return NextResponse.json(
        { error: "Health data is required" },
        { status: 400 }
      );
    }

    // ── Cognee: Store the health data snapshot in memory ─────────────────────
    // Fire-and-forget — ingestion happens in the background
    storeHealthEvent(effectiveUserId, "health_snapshot", {
      ...healthData,
      timestamp: new Date().toISOString(),
    }).catch((err) =>
      console.error("[Cognee] Failed to store health snapshot:", err)
    );

    // ── Cognee: Retrieve longitudinal trends to enrich the insight ────────────
    const trendContext = await queryHealthMemory(
      effectiveUserId,
      "recent health trends symptoms sleep activity"
    );

    const systemPrompt = `You are Memoir AI, generating a brief, personalised health insight. Analyse the provided health data and produce a single, actionable insight paragraph (2-3 sentences max).

Focus on:
- Patterns and correlations in the data
- Positive reinforcement for good habits
- Gentle suggestions for improvement
- Any notable trends

${trendContext ? `Additional context from the user's health memory:\n${trendContext}\n` : ""}

Be warm, specific, and concise. Do not use bullet points. Hard limit: your entire reply must be under 350 characters, and it must end on a complete sentence — never stop mid-sentence.`;

    const messages = [
      {
        role: "user" as const,
        content: `Generate a health insight based on this data:\n${JSON.stringify(healthData, null, 2)}`,
      },
    ];

    const response = await sendToGeminiAPI(messages, systemPrompt);

    return NextResponse.json({ insight: response });
  } catch (error) {
    console.error("Insights API error:", error);
    if (error instanceof GeminiApiError && error.status === 429) {
      return NextResponse.json(
        { error: "quota_exceeded", message: error.message },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Failed to generate insight" },
      { status: 500 }
    );
  }
}
