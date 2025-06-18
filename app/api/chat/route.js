// app/api/chat/route.js
import fs from "fs";
import path from "path";
import cosineSimilarity from "cosine-similarity";

// ---- load embeddings once (sync) ----
const embeddings = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "embeddings.json"), "utf8")
);

// --------------------------------------
// POST /api/chat  — runtime handler
// --------------------------------------
export async function POST(req) {
  // 1. Lazy‑load OpenAI client **inside** the handler so build time doesn’t need the key
  const { OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // 2. Parse user question from the request body
  const { question } = await req.json();
  if (!question) return new Response("Missing question", { status: 400 });

  // 3. Embed the user query
  const { data: embedData } = await openai.embeddings.create({
    model: "text-embedding-ada-002", // fast + cheap for vectors
    input: question,
  });
  const qVector = embedData[0].embedding;

  // 4. Retrieve the most relevant chunks (top‑3 by cosine similarity)
  const context = embeddings
    .map((e) => ({ ...e, score: cosineSimilarity(qVector, e.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((e) => e.text)
    .join("\n---\n");

  // 5. Ask GPT‑4o‑mini (a.k.a. 4.1‑mini)
  const chatResp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant who ONLY answers using the following resume excerpts. Market yourself as smart, excited, and eager for work. If the information isn’t in the excerpts, say you don’t know.\n" +
          context,
      },
      { role: "user", content: question },
    ],
  });

  const answer = chatResp.choices[0].message.content.trim();

  return Response.json({ answer });
}
