import { MeldState, StateProc, Subject } from "@m-ld/m-ld";

export const upsert =
  (subjects: Subject[]): StateProc<MeldState> =>
  async (state) => {
    await state.write({
      "@insert": subjects,
    });
  };
