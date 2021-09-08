import { join } from "path";

import fs from "fs/promises";
import { parseOmniFocusXML } from "./parseOmniFocusXML";
import JSZip from "jszip";
import { watch } from "chokidar";

const homeDir = process.env.HOME;

if (!homeDir) throw new Error("HOME not set! Can't find OmniFocus database.");

const omniFocusDatabasePath = join(
  homeDir,
  "Library/Containers/com.omnigroup.OmniFocus3/Data/Library/Application Support/OmniFocus/OmniFocus.ofocus",
);

watch(omniFocusDatabasePath, {
  ignoreInitial: true,
}).on("add", async (path) => {
  const data = await fs.readFile(path);
  const zip = await JSZip.loadAsync(data);
  const contents = await zip.file("contents.xml")?.async("text");
  contents && console.log(await parseOmniFocusXML(contents));
});
