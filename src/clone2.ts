import watchOmniFocus from "./watchOmniFocus";
import MemDown from "memdown";
import { clone, uuid } from "@m-ld/m-ld";
import { IoRemotes, MeldIoConfig } from "@m-ld/m-ld/dist/socket.io";

const config: MeldIoConfig = {
  "@id": uuid(),
  "@domain": "test.example.org",
  genesis: false, // This clone needs clone 1 to have started
  io: { uri: "http://localhost:3000" },
};

void (async () => {
  const meld = await clone(new MemDown(), IoRemotes, config);
  meld.status.subscribe((status) =>
    console.log("clone 2", "status is", status),
  );

  meld.follow(async (update, state) => {
    console.log("clone 2", "has update", update);
    const all = await state.read({
      "@describe": "?id",
      "@where": { "@id": "?id" },
    });
    console.log("clone 2", "has state", all);
  });

  await meld.write({ "@id": "hw2", message: "Hello World from clone 2!" });

  watchOmniFocus().subscribe((data) => {
    void meld.write(data);
  });
})();
