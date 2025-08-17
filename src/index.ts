import express from "express";
import { Request, Response } from "express";
import { exec } from "child_process";
import { spawn } from "child_process";
import path from "path";
const app = express();
import { OpenAI } from "openai";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./utils/connectDB";
import userRouter from "./routes/user.route"
dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const PORT = process.env.PORT || 8000;
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
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
        filter: {
          must: [{ key: "user_id", match: { value: "user_123" } }],
        },
      }
    );
   const context = qdrantSearch.data.result
  .map((item) => {
    const preview = item.payload?.preview || "";
    const filePath = item.payload?.file_path || "unknown file";
    const startLine = item.payload?.start_line ?? "?";
    const endLine = item.payload?.end_line ?? "?";

    return `File: ${filePath}\nLines: ${startLine}-${endLine}\n${preview}`;
  })
  .join("\n\n");



    // Step 3: Send context + prompt to OpenAI (with stream)
   const systemPrompt = `
You are a codebase assistant. ONLY answer questions using the context provided below.
If the answer is not in the context, respond with:
"I don't have enough information to answer that."

Each context snippet will include:
- File path
- Start and end line numbers
- Code preview

Use this information to refer to specific files and lines when answering.

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

  const outputDir = path.join(process.cwd(), "output").replace(/\\/g, "/");
  const dockerArgs = [
    "run",
    "--rm",
    "-e",
    `REPO_URL=${github_link}`,
    "-v",
    `${outputDir}:/app/output`,
    "github-cloner",
  ];

  console.log("🚀 Running Docker with args:\n", dockerArgs.join(" "));

  const docker = spawn("docker", dockerArgs);

  let stdoutData = "";
  let stderrData = "";

  docker.stdout.on("data", (data) => {
    stdoutData += data.toString();
  });

  docker.stderr.on("data", (data) => {
    stderrData += data.toString();
  });

  docker.on("close", (code) => {
    console.log(`🛑 Docker container exited with code: ${code}`);
    if (code === 0) {
      res.status(200).json({
        success: true,
        message: "Docker task completed successfully",
        output: stdoutData,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Docker task failed",
        error: stderrData || "Unknown error",
      });
    }
  });
});
app.use("/api/v1/users" , userRouter)
app.listen(8000, async () => {
  console.log("🚀 Server running on http://localhost:8000");
  await connectDB();
});
