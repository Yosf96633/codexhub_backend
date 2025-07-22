import express from "express";
import {Request , Response} from "express"
import { exec } from "child_process";
import path from "path";
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Express + TypeScript + PNPM!");
});

app.post('/api/url', async (req: Request, res: Response) => {
  const { github_link } = req.body;

  if (!github_link) {
    return res.status(400).json({ error: "GitHub link is required" });
  }

  console.log("📥 Received GitHub link:", github_link);

  const outputDir = path.join(process.cwd(), "output");
  const dockerCommand = `docker run -e REPO_URL=${github_link} -v "${outputDir.replace(/\\/g, "/")}:/app/output" github-cloner`;

  console.log("🚀 Running Docker command:\n", dockerCommand);

  exec(dockerCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return res.status(500).json({ error: "Docker command failed", details: error.message });
    }

    if (stderr) {
      console.warn(`⚠️ Stderr: ${stderr}`);
    }

    console.log(`✅ Docker Output:\n${stdout}`);
    return res.status(200).json({ message: "Docker task completed successfully", output: stdout });
  });
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
