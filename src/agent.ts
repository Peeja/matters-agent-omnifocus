import watchOmniFocus from "./watchOmniFocus";
import MemDown from "memdown";
import { clone, Subject, Update, uuid } from "@m-ld/m-ld";
import { IoRemotes, MeldIoConfig } from "@m-ld/m-ld/dist/socket.io";
import { isObject } from "lodash";

const SINGLE_VALUED = new Set([
  "http://peeja.com/purl/matters/omnifocus/o/added",
  "http://peeja.com/purl/matters/omnifocus/o/modified",
  "http://peeja.com/purl/matters/omnifocus/o/completed",
]);

const config: MeldIoConfig = {
  "@id": uuid(),
  "@domain": "test.example.org",
  genesis: true,
  io: { uri: "http://localhost:4000" },
  constraints: [...SINGLE_VALUED].map((property) => ({
    "@type": "single-valued",
    property,
  })),
};

interface IdentifiedSubject extends Subject {
  "@id": NonNullable<Subject["@id"]>;
}
const hasId = (subject: Subject): subject is IdentifiedSubject =>
  !!subject["@id"];

const update = (subjects: Subject[]): Update => {
  // If any of the subjects have @ids and are setting properties that are
  // single-valued, we need to delete any existing values when we add the new
  // one.
  const deletes = subjects.filter(hasId).flatMap((subject) =>
    Object.keys(subject)
      .filter((p) => SINGLE_VALUED.has(p))
      .map((property) => ({
        "@id": subject["@id"],
        [property]: "?previous",
      }))
      .filter(isObject),
  );

  return {
    "@delete": deletes,
    "@insert": subjects,
    // This weirdness is a workaround to ensure we do insert the new values,
    // even if there's nothing to delete first.
    // https://github.com/m-ld/m-ld-spec/issues/76#issuecomment-924669573
    "@where": { "@union": [...deletes, { "@values": {} }] },
  };
};

void (async () => {
  const meld = await clone(new MemDown(), IoRemotes, config);

  watchOmniFocus().subscribe(async ([version, data]) => {
    console.log("Reading version:", version);

    try {
      await meld.write(update(data as Subject[]));
    } catch (e) {
      console.error(JSON.stringify(e));
    }
  });
})();
