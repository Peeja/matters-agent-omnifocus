import watchOmniFocus from "./watchOmniFocus";
import MemDown from "memdown";
import { clone, uuid } from "@m-ld/m-ld";
import { IoRemotes, MeldIoConfig } from "@m-ld/m-ld/dist/socket.io";

const config: MeldIoConfig = {
  "@id": uuid(),
  "@domain": "test.example.org",
  genesis: true,
  io: { uri: "http://localhost:4000" },
};

void (async () => {
  const meld = await clone(new MemDown(), IoRemotes, config);

  watchOmniFocus().subscribe((data) => {
    void meld.write(data);
  });
})();
