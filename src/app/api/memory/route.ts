import { NextRequest, NextResponse } from "next/server";
import { storeHealthEvent, queryHealthMemory, isCogneeConfigured } from "@/lib/cognee";

// Default user ID — replace with real auth session userId when auth is wired up
const DEFAULT_USER_ID = "himanshu_default";

/**
 * POST /api/memory
 * Ingest a health event into the Cognee knowledge graph.
 *
 * Body: { eventType: string, data: object, userId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { eventType, data, userId } = await request.json();
    const effectiveUserId = userId || DEFAULT_USER_ID;

    if (!eventType || !data) {
      return NextResponse.json(
        { error: "eventType and data are required" },
        { status: 400 }
      );
    }

    if (!isCogneeConfigured()) {
      return NextResponse.json(
        {
          stored: false,
          message: "Cognee is not configured (COGNEE_API_URL / COGNEE_API_KEY missing)",
        },
        { status: 200 }
      );
    }

    await storeHealthEvent(effectiveUserId, eventType, {
      ...data,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ stored: true });
  } catch (error) {
    console.error("Memory POST error:", error);
    return NextResponse.json(
      { error: "Failed to store memory" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/memory?query=...&userId=...
 * Query the Cognee knowledge graph and return relevant context.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const userId = searchParams.get("userId") || DEFAULT_USER_ID;

    if (!query) {
      return NextResponse.json(
        { error: "query parameter is required" },
        { status: 400 }
      );
    }

    if (!isCogneeConfigured()) {
      return NextResponse.json(
        {
          context: "",
          message: "Cognee is not configured",
        },
        { status: 200 }
      );
    }

    const context = await queryHealthMemory(userId, query);
    return NextResponse.json({ context });
  } catch (error) {
    console.error("Memory GET error:", error);
    return NextResponse.json(
      { error: "Failed to query memory" },
      { status: 500 }
    );
  }
}
