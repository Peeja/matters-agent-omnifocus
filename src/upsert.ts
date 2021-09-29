import { Construct, MeldClone, StateProc, Subject } from "@m-ld/m-ld";

function assertIRI(key: string) {
  try {
    new URL(key);
  } catch (e) {
    throw new Error(
      `upsert() does not yet support non-IRI properties, but got ${key}`,
    );
  }
}

export const upsert = (subjects: Subject[]): StateProc<MeldClone> => {
  const values = subjects.flatMap((subject) =>
    Object.keys(subject)
      .filter((key) => key != "@id")
      .map((key) => {
        assertIRI(key);
        return {
          "?id": { "@id": subject["@id"] },
          "?property": { "@id": key },
        };
      }),
  );

  return async (state) => {
    const existingData = await state.read<Construct>({
      "@construct": { "@id": "?id", "?property": "?value" },
      "@where": {
        "@graph": {
          "@id": "?id",
          "?property": "?value",
        },
        "@values": values,
      },
    });

    await state.write({
      "@delete": existingData,
      "@insert": subjects,
    });
  };
};
