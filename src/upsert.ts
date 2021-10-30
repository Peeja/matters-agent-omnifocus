import { Construct, MeldClone, StateProc, Subject } from "@m-ld/m-ld";

// Only used for JSDoc.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { MeldStateMachine } from "@m-ld/m-ld";

/**
 * Creates a {@link StateProc} which will upsert the given data. That is, for
 * every property in the {@link subject} data that is in
 * {@link singleValuedProperties}, it will delete any existing value before
 * inserting a new value. Non-single-valued properties in the subject data will
 * be inserted normally.
 * @param subjects The data to upsert into the state.
 * @param singleValuedProperties A list of property names to consider
 * "single-valued".
 * @returns An upserting {@link StateProc} suitable for passing to
 * {@link MeldStateMachine.write}.
 */
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
