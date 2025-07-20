import chokidar from "chokidar";
import path from "path";
import { sendToQueue } from "./mq";

const outputDir = path.join(__dirname, "../../output");

console.log("👀 Watching for new cloned repos in:", outputDir);

const watcher = chokidar.watch(outputDir, {
  ignoreInitial: false,
  depth: 0,
});
console.log("After watcher")
watcher.on("addDir", async (folderPath) => {
  console.log("Function run")
  const folderName = path.basename(folderPath);
  console.log("Folder Path -> , " , folderPath);
    console.log("Folder Name -> , " , folderName);
  await sendToQueue(folderPath);
});
