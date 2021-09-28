import { Construct, MeldState, StateProc, Subject } from "@m-ld/m-ld";

export const upsert =
  (subjects: Subject[]): StateProc<MeldState> =>
  async (state) => {
    const existingData = await state.read<Construct>({
      "@construct": { "@id": "?id", "?property": "?value" },
      "@where": {
        "@graph": {
          "@id": "?id",
          "?property": "?value",
        },
        "@values": subjects.map((subject) => ({
          "?id": { "@id": subject["@id"] },
        })),
      },
    });

    await state.write({
      "@delete": existingData,
      "@insert": subjects,
    });
  };
