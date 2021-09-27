import { Construct, MeldState, StateProc, Subject } from "@m-ld/m-ld";

export const upsert =
  (subjects: Subject[]): StateProc<MeldState> =>
  async (state) => {
    const existingData = await state.read<Construct>({
      "@construct": { "@id": "?id", "?property": "?value" },
      "@where": {
        "@id": "?id",
        "?property": "?value",
      },
    });

    await state.write({
      "@delete": existingData,
      "@insert": subjects,
    });
  };
