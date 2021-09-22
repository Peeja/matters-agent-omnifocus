import { basename, join } from "path";

import fs from "fs/promises";

import { parseOmniFocusXML } from "./parseOmniFocusXML";
import { JSONValue } from "./types";
import { isString } from "lodash";
import JSZip from "jszip";
import { watch } from "chokidar";
import { concatMap, filter, fromEvent, Observable } from "rxjs";

const homeDir = process.env.HOME;

if (!homeDir) throw new Error("HOME not set! Can't find OmniFocus database.");

const omniFocusDatabasePath = join(
  homeDir,
  "Library/Containers/com.omnigroup.OmniFocus3/Data/Library/Application Support/OmniFocus/OmniFocus.ofocus",
);

export default function watchOmniFocus(): Observable<
  readonly [string, JSONValue]
> {
  return fromEvent(
    watch(omniFocusDatabasePath, {
      ignoreInitial: true,
    }),
    "add",
  ).pipe(
    filter(isString),
    concatMap(async (path) => {
      const data = await fs.readFile(path);
      const zip = await JSZip.loadAsync(data);
      const zipObject = zip.file("contents.xml");

      if (zipObject) {
        return [
          basename(path, ".zip"),
          await parseOmniFocusXML(await zipObject.async("text")),
        ] as const;
      }
    }),
    filter(Boolean),
  );
}
