# Memoir — Your Personal Health Operating System

Memoir is a calm, private health companion: track medications, symptoms, fitness,
sleep, mood, and documents in one place, with an AI assistant that actually knows
your data. Built with Next.js (App Router), it runs entirely client-side for your
health data — nothing lives in a server database — with Google Gemini for AI
conversation and **Cognee** as a long-term memory layer behind that AI.

This README focuses in particular on **why Cognee is used, how it's wired into the
app, and how it's supposed to behave** — since that's the least obvious part of the
architecture.

---

## What's in the app

| Area | What it does |
|---|---|
| **Dashboard** | Home base — today's medications, appointments, mood calendar, on-demand AI insight |
| **Medical** | Medications, adherence/symptom charts, doctor contacts |
| **Health & Fitness** | Workouts, nutrition, sleep, water, steps, weekly goals |
| **Symptoms** | Daily severity log per symptom + a history heatmap |
| **Dear Diary** | Mood + free-write journal, streaks, monthly mood calendar |
| **AI Chat** | Conversational assistant grounded in your actual logged data |
| **Documents** | Store medical documents (lab reports, prescriptions) |
| **Profile & Settings** | Edit details, export/delete your data, sign out |

Every account is isolated: signing up creates a fresh, separate space (in
`localStorage`, namespaced per account) so one browser can hold multiple
independent accounts without their data ever mixing.

---

## Tech stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS 4** for styling, **Framer Motion** for animation
- **Google Gemini** (`gemini-2.5-flash`) for chat responses and AI insights
- **Cognee** for long-term conversational memory (see below)
- **Resend** for transactional email (appointment confirmations)
- **Google Identity Services** for "Continue with Google" sign-in
- No server-side database — user data lives in the browser via `localStorage`

---

## Why Cognee — the actual problem it solves

The app already has a place for **current facts**: your medications, symptoms,
profile, and logs all live in `localStorage`, read and written directly. That's
fast, exact, and cheap — a `WHERE` clause never accidentally returns a medication
you removed three months ago.

But the AI Chat and AI Insight features need something a flat data store doesn't
give you: **memory that persists and compounds across separate conversations**,
and the ability to reason over it. Examples of what that means in practice:

- You mention feeling stressed in the diary on Monday, then ask the AI chat about
  headaches on Friday — a useful assistant should be able to connect those two
  unrelated log entries, days apart, without you re-explaining the context.
- Every symptom log, diary entry, and chat turn should quietly accumulate into a
  picture the AI can draw on later, without the app needing to hand-write "if
  headache AND stress THEN mention correlation" logic for every possible pattern.

A plain database can store all of that text, but it can't *reason* over it in
response to a free-form question — you'd need to write bespoke queries for every
pattern you want to detect ahead of time. **Cognee turns stored text into a
knowledge graph** (extracting entities and the relationships between them) and
lets you query that graph with a natural-language question, getting back a
synthesized answer rather than a raw row of data. That's the specific capability
being bought here — semantic recall and connection-finding, not just storage.

The trade-off, and it's a real one: this is fuzzier and slower than a database
query, and (as covered below) it can surface stale information if you're not
careful about how it's blended with current facts. Cognee is the memory/reasoning
layer *on top of* the source of truth — it deliberately does not replace it.

---

## How Cognee is used in this app

All of the integration lives in **`src/lib/cognee.ts`**, with three functions:

```ts
isCogneeConfigured()                         // true if COGNEE_API_URL + COGNEE_API_KEY are set
storeHealthEvent(userId, eventType, data)     // write an event into the user's memory graph
queryHealthMemory(userId, query)              // ask the graph a natural-language question
```

### Where it's called from

| Call site | What it stores / asks |
|---|---|
| `POST /api/chat` | **Stores** every chat turn (`chat_turn`: your message + the AI's reply) after responding. **Queries** memory using your latest message *before* responding, to pull in relevant history. |
| `POST /api/insights` | **Stores** a `health_snapshot` of your current dashboard data. **Queries** memory for `"recent health trends symptoms sleep activity"` to enrich the generated insight. |
| `POST /api/memory` (used by the **Diary** and **Symptoms** pages) | **Stores** `diary_entry` and `symptom_log` events whenever you save one. |

Every user gets **their own isolated dataset**, named `user_{userId}` — where
`userId` is the same per-account ID that isolates your `localStorage` data. Two
different Memoir accounts on the same browser (or different browsers entirely)
never share a memory graph.

If `COGNEE_API_URL` or `COGNEE_API_KEY` isn't set, every function above becomes a
silent no-op — the app works fully without Cognee, it just loses the long-term
memory layer. Nothing breaks; the chat and insights still work off Gemini alone.

---

## How it's supposed to function, mechanically

Cognee's REST API (`docs.cognee.ai/api-reference`) is used directly via `fetch` —
no SDK. Two operations happen behind the scenes:

**Writing memory** (`storeHealthEvent`):
1. The event is serialized to a plain text blob: `[EVENTTYPE] <timestamp>\n<JSON>`
2. `POST /api/v1/add` uploads that blob as a file into the user's dataset
3. `POST /api/v1/cognify` is triggered on that dataset — this is where Cognee
   actually extracts entities and relationships from the raw text and folds them
   into the knowledge graph. This step is what makes the data *searchable* later;
   skipping it would leave the text stored but not reasoned-over.

**Reading memory** (`queryHealthMemory`):
1. `POST /api/v1/search` is called with `searchType: "GRAPH_COMPLETION"` and the
   natural-language question (e.g. your latest chat message)
2. Cognee traverses the graph for relevant nodes and **synthesizes an answer in
   plain language** — it's not a keyword search returning raw snippets, it
   composes a response from what it finds
3. That synthesized text gets labeled `[Memory from Cognee Knowledge Graph]` and
   injected into Gemini's system prompt as supplementary context

### The one rule that matters: memory is never the source of truth

Early on, this produced a real bug worth documenting: Cognee's graph accumulates
*everything* ever stored, forever, with no expiry. During development, test data
(placeholder medications, fabricated stats) got written into the graph, and later
showed up blended into real answers — the AI stated an old, no-longer-true
medication as a current fact, because nothing told it not to.

The fix is in the system prompt built in `src/app/api/chat/route.ts`: the live
health data (read straight from `localStorage`, passed in as `healthContext`) is
explicitly framed as the **current, authoritative source of truth**, and anything
retrieved from Cognee is explicitly framed as **historical, possibly outdated
context that must never be stated as a current fact unless it's also confirmed in
the live data**. In short:

- `localStorage` → what is true *right now*
- Cognee → what has happened *over time*, useful for connecting the dots, never
  used to override what's currently true

If you extend this integration, preserve that framing — it's the difference
between "helpful long-term memory" and "AI confidently states wrong information."

---

## Environment variables

None of these are committed (`.env.local` is gitignored). If you're deploying (e.g.
to Vercel), these need to be set in the platform's dashboard, not just locally.

```bash
# Google Gemini — required for chat/insights
GEMINI_API_KEY=

# Cognee — optional; app works without it, just without long-term memory
COGNEE_API_URL=
COGNEE_API_KEY=

# Resend — optional; enables appointment confirmation emails
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Google Sign-In — optional; enables "Continue with Google" on the auth page
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up to create a local
account — your data stays in that browser, isolated per account.

## Deployment

This is a standard Next.js app — deploys cleanly to Vercel's free tier. Remember:
`NEXT_PUBLIC_*` variables are baked in at **build time**, so set them in Vercel's
project settings *before* the first deploy that needs them, and redeploy after
changing any of them.
