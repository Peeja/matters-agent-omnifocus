import { Construct, MeldClone, StateProc, Subject } from "@m-ld/m-ld";

export const upsert = (
  subjects: Subject[],
  singleValuedProperties: string[],
): StateProc<MeldClone> => {
  const values = subjects.flatMap((subject) =>
    Object.keys(subject)
      .filter((key) => key != "@id" && singleValuedProperties.includes(key))
      .map((key) => ({
        "?id": { "@id": subject["@id"] },
        "?property": { "@vocab": key },
      })),
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
