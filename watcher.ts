import chokidar from "chokidar";
import path from "path";

const outputDir = path.join(__dirname, "output");

console.log("👀 Watching for new cloned repos in:", outputDir);

const watcher = chokidar.watch(outputDir, {
  ignoreInitial: true,
  depth: 0,
});

watcher.on("addDir", (folderPath) => {
  const folderName = path.basename(folderPath);
  console.log(`📦 New repo folder created: ${folderName}`);
});
