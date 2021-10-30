import { Construct, MeldClone, StateProc, Subject, Update } from "@m-ld/m-ld";

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
export const upsert =
  (
    subjects: Subject[],
    singleValuedProperties: string[],
  ): StateProc<MeldClone> =>
  async (state) => {
    // Get all existing single-valued data we're trying to overwrite (ie,
    // properties that are single-valued and are in the `subjects` we were given
    // to write). Do this in one read per subject, because otherwise the query
    // becomes too complex and Comunica blows the stack.
    const existingData = (
      await Promise.all(
        subjects.map(async (subject): Promise<Subject[]> => {
          if (!subject["@id"]) return [] as Subject[];

          const keysToOverwrite = Object.keys(subject).filter(
            (key) => key != "@id" && singleValuedProperties.includes(key),
          );

          const pattern: Subject = {
            "@id": subject["@id"],
            ...Object.fromEntries(
              keysToOverwrite.map((key) => [key, "?value"]),
            ),
          };

          return state.read<Construct>({
            "@construct": pattern,
            "@where": pattern,
          });
        }),
      )
    ).flat();

    await state.write<Update>({
      "@delete": existingData,
      "@insert": subjects,
    });
  };
