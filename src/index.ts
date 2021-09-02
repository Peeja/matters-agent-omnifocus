import { ChildProcess, fork } from "child_process";

const started = (childProcess: ChildProcess) =>
  new Promise<void>((resolve) =>
    childProcess.on("message", (message) => {
      if (message === "started") resolve();
    }),
  );

void (async () => {
  await started(fork("src/broker"));
  await started(fork("src/clone1"));
  fork("src/clone2");
})();
