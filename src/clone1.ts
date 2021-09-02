import MemDown from "memdown";
import { clone, uuid } from "@m-ld/m-ld";
import { MeldMqttConfig, MqttRemotes } from "@m-ld/m-ld/dist/mqtt";

const config: MeldMqttConfig = {
  "@id": uuid(),
  "@domain": "test.example.org",
  genesis: true,
  mqtt: { host: "localhost", port: 1883 },
};

void (async () => {
  const meld = await clone(new MemDown(), MqttRemotes, config);
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
