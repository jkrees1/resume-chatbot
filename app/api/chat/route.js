// app/api/chat/route.js
import fs from 'fs';
import path from 'path';
import cosineSimilarity from 'cosine-similarity';
import { OpenAI } from 'openai';

// load env for serverless edge/Node
import 'dotenv/config';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// -------  Load embeddings into memory once -------- //
const embeddings = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'embeddings.json'))
);

// utility: get top-N chunks by cosine similarity
function retrieveContext(queryEmbedding, topN = 3) {
  const ranked = embeddings
    .map((e) => ({
      ...e,
      score: cosineSimilarity(queryEmbedding, e.vector),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return ranked.map((r) => r.text).join('\n---\n');
}

// -------- POST handler -------- //
export async function POST(req) {
  const { question } = await req.json();

  // 1 embed the user question
  const qEmbedResp = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: question,
  });
  const qVector = qEmbedResp.data[0].embedding;

  // 2 retrieve relevant chunks
  const context = retrieveContext(qVector, 3);

  // 3 ask Chat Completion
  const chatResp = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant that ONLY answers from the following resume excerpts. Your goal as a helpful assistant is to market yourself as smart, excited and eager for work. If the answer is not contained, say you do not know.\n' +
          context,
      },
      { role: 'user', content: question },
    ],
  });

  const answer = chatResp.choices[0].message.content.trim();

  return Response.json({ answer });
}
