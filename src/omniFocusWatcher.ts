import { join } from "path";

import fs from "fs/promises";
import JSZip from "jszip";
import { watch } from "chokidar";

const homeDir = process.env.HOME;

if (!homeDir) throw new Error("HOME not set! Can't find OmniFocus database.");

const omniFocusDatabasePath = join(
  homeDir,
  "Library/Containers/com.omnigroup.OmniFocus3/Data/Library/Application Support/OmniFocus/OmniFocus.ofocus",
);

watch(omniFocusDatabasePath).on("all", async (event, path) => {
  console.log(event, path);
  const data = await fs.readFile(path);
  const zip = await JSZip.loadAsync(data);
  const contents = await zip.file("contents.xml")?.async("text");
  console.log(contents);
});
