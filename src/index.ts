import express from "express";
import {Request , Response} from "express"
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Express + TypeScript + PNPM!");
});

app.post('/api/url' , async (req:Request , res:Response) => {
        const {github_link} = req.body;
        console.log(github_link);
        return res.status(200).json({data:github_link})
})
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
