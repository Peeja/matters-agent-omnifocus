import { ChildProcess, fork } from "child_process";

const started = (childProcess: ChildProcess) =>
  new Promise<void>((resolve) =>
    childProcess.on("message", (message) => {
      if (message === "started") resolve();
    }),
  );

void (async () => {
  await started(fork("src/broker"));
  fork("src/agent");
})();
