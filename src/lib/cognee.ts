// Cognee Memory Helper — Real REST API integration
// Communicates with the Cognee backend via its REST API (docs.cognee.ai/api-reference).
// Gracefully degrades to no-op if COGNEE_API_URL or COGNEE_API_KEY are not set.

const COGNEE_API_URL = (process.env.COGNEE_API_URL || "").trim().replace(/\/$/, "");
const COGNEE_API_KEY = (process.env.COGNEE_API_KEY || "").trim();

/** Returns true if Cognee is configured */
export function isCogneeConfigured(): boolean {
  return Boolean(COGNEE_API_URL && COGNEE_API_KEY);
}

/** Base fetch wrapper for all Cognee REST calls */
async function cogneeFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${COGNEE_API_URL}/api/v1${path}`;
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    "X-Api-Key": COGNEE_API_KEY,
    ...(options.headers as Record<string, string> | undefined),
  };
  // Let fetch set the multipart boundary itself — don't force JSON content-type.
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, { ...options, headers });
}

/**
 * Add a text payload to a Cognee dataset via multipart/form-data,
 * as required by POST /api/v1/add (`data` is a file upload field).
 */
async function addTextToDataset(
  dataset: string,
  text: string,
  filename: string
): Promise<boolean> {
  const form = new FormData();
  form.append("data", new Blob([text], { type: "text/plain" }), filename);
  form.append("datasetName", dataset);

  const addRes = await cogneeFetch("/add", {
    method: "POST",
    body: form,
  });

  if (!addRes.ok) {
    const err = await addRes.text();
    console.error(`[Cognee] /add failed (${addRes.status}):`, err);
    return false;
  }
  return true;
}

/** Trigger graph cognification (entity extraction + linking) for a dataset. */
async function cognifyDataset(dataset: string): Promise<boolean> {
  const cognifyRes = await cogneeFetch("/cognify", {
    method: "POST",
    body: JSON.stringify({ datasets: [dataset] }),
  });

  if (!cognifyRes.ok) {
    const err = await cognifyRes.text();
    console.error(`[Cognee] /cognify failed (${cognifyRes.status}):`, err);
    return false;
  }
  return true;
}

/**
 * Store a health event in Cognee's memory graph.
 * Uses dataset scoped per user: "user_{userId}"
 */
export async function storeHealthEvent(
  userId: string,
  eventType: string,
  data: Record<string, unknown>
): Promise<void> {
  if (!isCogneeConfigured()) {
    console.log(`[Cognee] Not configured — skipping store for ${eventType}`);
    return;
  }

  const dataset = `user_${userId}`;
  const text = `[${eventType.toUpperCase()}] ${new Date().toISOString()}\n${JSON.stringify(data, null, 2)}`;

  try {
    const added = await addTextToDataset(dataset, text, `${eventType}-${Date.now()}.txt`);
    if (!added) return;

    const cognified = await cognifyDataset(dataset);
    if (cognified) {
      console.log(`[Cognee] Stored ${eventType} for user ${userId}`);
    }
  } catch (err) {
    console.error("[Cognee] storeHealthEvent network error:", err);
  }
}

/**
 * Query the health memory graph for AI-enriched context.
 * Returns a formatted string to inject into the AI's system prompt.
 */
export async function queryHealthMemory(
  userId: string,
  query: string
): Promise<string> {
  if (!isCogneeConfigured()) {
    console.log(`[Cognee] Not configured — skipping memory query`);
    return "";
  }

  const dataset = `user_${userId}`;

  try {
    const res = await cogneeFetch("/search", {
      method: "POST",
      body: JSON.stringify({
        query,
        searchType: "GRAPH_COMPLETION",
        datasets: [dataset],
        topK: 5,
        onlyContext: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[Cognee] /search failed (${res.status}):`, err);
      return "";
    }

    const result = await res.json();

    // Cognee returns an array of SearchResult: { search_result, dataset_id, dataset_name }
    if (Array.isArray(result) && result.length > 0) {
      const lines = result
        .map((r: { search_result?: unknown }) => {
          const sr = r.search_result;
          if (typeof sr === "string") return sr;
          if (Array.isArray(sr)) {
            return sr.filter((v) => typeof v === "string").join("\n");
          }
          if (sr && typeof sr === "object") {
            const obj = sr as { text?: string; content?: string };
            return obj.text || obj.content || JSON.stringify(sr);
          }
          return "";
        })
        .filter(Boolean)
        .join("\n---\n");
      return lines ? `[Memory from Cognee Knowledge Graph]\n${lines}` : "";
    }

    return "";
  } catch (err) {
    console.error("[Cognee] queryHealthMemory network error:", err);
    return "";
  }
}

/**
 * Batch-store multiple health data records and build a full knowledge graph.
 * Useful for initial onboarding or bulk data imports.
 */
export async function buildHealthGraph(
  userId: string,
  data: Record<string, unknown>[]
): Promise<void> {
  if (!isCogneeConfigured()) {
    console.log(`[Cognee] Not configured — skipping graph build`);
    return;
  }

  const dataset = `user_${userId}`;

  try {
    // Combine all records into one document for efficiency
    const combined = data
      .map((d, i) => `[Record ${i + 1}] ${JSON.stringify(d)}`)
      .join("\n\n");

    const added = await addTextToDataset(dataset, combined, `health-graph-${Date.now()}.txt`);
    if (!added) return;

    const cognified = await cognifyDataset(dataset);
    if (cognified) {
      console.log(`[Cognee] Built health graph for user ${userId} with ${data.length} records`);
    }
  } catch (err) {
    console.error("[Cognee] buildHealthGraph network error:", err);
  }
}
