import { join } from "path";

import fs from "fs/promises";

import { parseOmniFocusXML } from "./parseOmniFocusXML";
import JSZip from "jszip";
import { watch } from "chokidar";
import { concatMap, filter, fromEvent, Observable } from "rxjs";
import { Subject } from "@m-ld/m-ld";

const homeDir = process.env.HOME;

if (!homeDir) throw new Error("HOME not set! Can't find OmniFocus database.");

const omniFocusDatabasePath = join(
  homeDir,
  "Library/Containers/com.omnigroup.OmniFocus3/Data/Library/Application Support/OmniFocus/OmniFocus.ofocus/*.zip",
);

export default function watchOmniFocus(): Observable<Subject[]> {
  const watcher = watch(omniFocusDatabasePath);

  watcher.on("ready", () => {
    console.log("All caught up.");
  });

  return fromEvent(watcher, "add", (path: string) => path).pipe(
    concatMap(async (path) => {
      const data = await fs.readFile(path);
      const zip = await JSZip.loadAsync(data);
      const zipObject = zip.file("contents.xml");

      if (zipObject) {
        return parseOmniFocusXML(await zipObject.async("text"));
      }
    }),
    filter(Boolean),
  );
}
