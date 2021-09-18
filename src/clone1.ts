import MemDown from "memdown";
import { clone, uuid } from "@m-ld/m-ld";
import { MeldIoConfig, IoRemotes } from "@m-ld/m-ld/dist/socket.io/IoRemotes";

const config: MeldIoConfig = {
  "@id": uuid(),
  "@domain": "test.example.org",
  genesis: true,
  io: { uri: "http://localhost:4000" },
};

void (async () => {
  console.log("Starting clone1...");
  const meld = await clone(new MemDown(), IoRemotes, config);
  meld.status.subscribe((status) =>
    console.log("clone 1", "status is", status),
  );

  process.send && process.send("started");

  meld.follow(async (update, state) => {
    console.log("clone 1", "has update", update);
    const all = await state.read({
      "@describe": "?id",
      "@where": { "@id": "?id" },
    });
    console.log("clone 1", "has state", all);
  });

  await meld.write({ "@id": "hw1", message: "Hello World from clone 1!" });

  // ...
})();
