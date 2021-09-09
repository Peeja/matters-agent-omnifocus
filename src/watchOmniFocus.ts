import { join } from "path";

import fs from "fs/promises";

import { parseOmniFocusXML } from "./parseOmniFocusXML";
import { JSONValue } from "./types";
import { isString } from "lodash";
import JSZip from "jszip";
import { watch } from "chokidar";
import { concatMap, filter, fromEvent, map, Observable } from "rxjs";

const homeDir = process.env.HOME;

if (!homeDir) throw new Error("HOME not set! Can't find OmniFocus database.");

const omniFocusDatabasePath = join(
  homeDir,
  "Library/Containers/com.omnigroup.OmniFocus3/Data/Library/Application Support/OmniFocus/OmniFocus.ofocus",
);

watchOmniFocus().subscribe((data) => {
  console.log(data);
});

export default function watchOmniFocus(): Observable<JSONValue> {
  return fromEvent(
    watch(omniFocusDatabasePath, {
      ignoreInitial: true,
    }),
    "add",
  ).pipe(
    filter(isString),
    concatMap((path) => fs.readFile(path)),
    concatMap((data) => JSZip.loadAsync(data)),
    map((zip) => zip.file("contents.xml")),
    filter(Boolean),
    concatMap((zipObject) => zipObject.async("text")),
    concatMap(parseOmniFocusXML),
  );
}
