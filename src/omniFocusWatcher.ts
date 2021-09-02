import { join } from "path";
import { watch } from "chokidar";

const homeDir = process.env.HOME;

if (!homeDir) throw new Error("HOME not set! Can't find OmniFocus database.");

const omniFocusDatabasePath = join(
  homeDir,
  "Library/Containers/com.omnigroup.OmniFocus3/Data/Library/Application Support/OmniFocus/OmniFocus.ofocus",
);

watch(omniFocusDatabasePath).on("all", (event, path) => {
  console.log(event, path);
});
