import express from "express";
import { Request, Response } from "express";
import { exec } from "child_process";
import path from "path";
const app = express();
import { OpenAI } from "openai";
import axios from "axios";
import cors from "cors"
import dotenv from "dotenv";
dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const PORT = process.env.PORT || 8000;
app.use(cors({
   origin: "http://localhost:3000", 
  credentials: true
}));
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello from Express + TypeScript + PNPM!");
});
app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    // Step 1: Convert prompt to embedding
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: prompt,
    });

    const userEmbedding = embeddingRes.data[0].embedding;

    // Step 2: Search Qdrant
    const qdrantSearch = await axios.post(
      "http://localhost:6333/collections/codebase/points/search",
      {
        vector: userEmbedding,
        top: 5,
        with_payload: true,
      }
    );

    const context = qdrantSearch.data.result
      .map((item) => item.payload?.text || "")
      .join("\n");

    // Step 3: Send context + prompt to OpenAI (with stream)
    const systemPrompt = `
You are a codebase assistant. ONLY answer questions using the context provided below.
If the answer is not in the context, respond with:
"I don't have enough information to answer that."

Context:
\`\`\`
${context}
\`\`\`
`;


    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of completion) {
      const content = chunk.choices?.[0]?.delta?.content || "";
      res.write(`data: ${content}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/url", async (req: Request, res: Response) => {
  const { github_link } = req.body;

  if (!github_link) {
    return res.status(400).json({ error: "GitHub link is required" });
  }

  console.log("📥 Received GitHub link:", github_link);

  const outputDir = path.join(process.cwd(), "output");
  const dockerCommand = `docker run -e REPO_URL=${github_link} -v "${outputDir.replace(
    /\\/g,
    "/"
  )}:/app/output" github-cloner`;

  console.log("🚀 Running Docker command:\n", dockerCommand);

  exec(dockerCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return res
        .status(500)
        .json({ error: "Docker command failed", details: error.message });
    }

    if (stderr) {
      console.warn(`⚠️ Stderr: ${stderr}`);
    }

    console.log(`✅ Docker Output:\n${stdout}`);
    return res
      .status(200)
      .json({ message: "Docker task completed successfully", output: stdout });
  });
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
