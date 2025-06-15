const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { chunk } = require('lodash');
require('dotenv').config({ path: '.env.local' });

// Initialize OpenAI client (v4)
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Extract text from PDF
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const { text } = await pdf(dataBuffer);
  return text;
}

async function main() {
  const docsDir = path.join(process.cwd(), 'public', 'docs');
  // Include .pdf and .txt
  const files = fs
    .readdirSync(docsDir)
    .filter((f) => f.endsWith('.pdf') || f.endsWith('.txt'));

  const allChunks = [];
  for (const file of files) {
    const filePath = path.join(docsDir, file);
    let text;
    if (file.endsWith('.pdf')) {
      text = await extractTextFromPDF(filePath);
    } else {
      text = fs.readFileSync(filePath, 'utf-8');
    }
    // 500-word chunks
    const words = text.split(/\s+/);
    const chunks = chunk(words, 500).map((w) => w.join(' '));
    chunks.forEach((chunkText) => allChunks.push({ doc: file, text: chunkText }));
  }

  const embeddings = [];
  for (const { doc, text } of allChunks) {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    const vector = response.data[0].embedding;
    embeddings.push({ doc, text, vector });
  }

  fs.writeFileSync(
    path.join(process.cwd(), 'embeddings.json'),
    JSON.stringify(embeddings, null, 2)
  );

  console.log(`Embeddings built: ${embeddings.length}`);
}

main().catch((error) => {
  console.error('Error building embeddings:', error);
  process.exit(1);
});
