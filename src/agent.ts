import watchOmniFocus from "./watchOmniFocus";
import { upsert } from "./upsert";
import MemDown from "memdown";
import { clone, uuid } from "@m-ld/m-ld";
import { IoRemotes, MeldIoConfig } from "@m-ld/m-ld/dist/socket.io";

const SINGLE_VALUED = [
  "http://peeja.com/purl/matters/omnifocus/o/name",
  "http://peeja.com/purl/matters/omnifocus/o/note",
  "http://peeja.com/purl/matters/omnifocus/o/added",
  "http://peeja.com/purl/matters/omnifocus/o/modified",
  "http://peeja.com/purl/matters/omnifocus/o/completed",
];

const config: MeldIoConfig = {
  "@id": uuid(),
  "@domain": "test.example.org",
  genesis: true,
  io: { uri: "http://localhost:4000" },
  constraints: SINGLE_VALUED.map((property) => ({
    "@type": "single-valued",
    property,
  })),
};

void (async () => {
  const meld = await clone(new MemDown(), IoRemotes, config);

  watchOmniFocus().subscribe(async (data) => {
    try {
      await meld.write(upsert(data, SINGLE_VALUED));
    } catch (e) {
      console.error(JSON.stringify(e));
    }
  });
})();
