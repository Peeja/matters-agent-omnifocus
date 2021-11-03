import { upsert } from "./upsert";
import { mock } from "jest-mock-extended";
import { MeldRemotes } from "@m-ld/m-ld/dist/engine";
import { clone, MeldConfig, MeldReadState, Subject } from "@m-ld/m-ld";
import MemDown from "memdown";
import { BehaviorSubject } from "rxjs";
import { sortBy } from "lodash";

function mockRemotes(): MeldRemotes {
  return {
    ...mock<MeldRemotes>(),
    setLocal: () => {
      /* noop */
    },
    live: new BehaviorSubject(null),
  };
}

function testConfig(config?: Partial<MeldConfig>): MeldConfig {
  return {
    "@id": "test",
    "@domain": "test.peeja.org",
    genesis: true,
    ...config,
  };
}

async function testClone(initialData?: Subject | Subject[]) {
  const meld = await clone(new MemDown(), mockRemotes(), testConfig());
  if (initialData) await meld.write(initialData);
  return meld;
}

/** Read all data in `state`, sorted for stability in test expectations. */
async function readAll(state: MeldReadState) {
  return sortBy(
    await state.read({
      "@describe": "?id",
      "@where": { "@id": "?id" },
    }),
    "@id",
  );
}

describe("upsert()", () => {
  it("inserts when there is no existing value", async () => {
    const meld = await testClone();

    await meld.write(
      upsert(
        [
          {
            "@id": "foo",
            aProperty: "new-value",
          },
        ],
        ["aProperty"],
      ),
    );

    expect(await readAll(meld)).toEqual([
      {
        "@id": "foo",
        aProperty: "new-value",
      },
    ]);
  });

  it("updates when there is an existing value", async () => {
    const meld = await testClone({
      "@id": "foo",
      aProperty: "existing-value",
    });

    await meld.write(
      upsert(
        [
          {
            "@id": "foo",
            aProperty: "new-value",
          },
        ],
        ["aProperty"],
      ),
    );

    expect(await readAll(meld)).toEqual([
      {
        "@id": "foo",
        aProperty: "new-value",
      },
    ]);
  });

  it("leaves other subjects' properties alone", async () => {
    const meld = await testClone([
      {
        "@id": "foo",
        aProperty: "existing-value",
      },
      {
        "@id": "bar",
        aProperty: "another-existing-value",
      },
    ]);

    await meld.write(
      upsert(
        [
          {
            "@id": "foo",
            aProperty: "new-value",
          },
        ],
        ["aProperty"],
      ),
    );

    expect(await readAll(meld)).toEqual([
      {
        "@id": "bar",
        aProperty: "another-existing-value",
      },
      {
        "@id": "foo",
        aProperty: "new-value",
      },
    ]);
  });

  it("leaves non-inserted properties alone", async () => {
    const meld = await testClone({
      "@id": "foo",
      aProperty: "existing-value",
      anotherProperty: "another-existing-value",
    });

    await meld.write(
      upsert(
        [
          {
            "@id": "foo",
            aProperty: "new-value",
          },
        ],
        ["aProperty", "anotherProperty"],
      ),
    );

    expect(await readAll(meld)).toEqual([
      {
        "@id": "foo",
        aProperty: "new-value",
        anotherProperty: "another-existing-value",
      },
    ]);
  });

  it("leaves non-single-valued properties alone", async () => {
    const meld = await testClone({
      "@id": "foo",
      aProperty: "existing-value",
      anotherProperty: "another-existing-value",
    });

    await meld.write(
      upsert(
        [
          {
            "@id": "foo",
            aProperty: "new-value",
            anotherProperty: "another-new-value",
          },
        ],
        ["aProperty"],
      ),
    );

    expect(await readAll(meld)).toEqual([
      {
        "@id": "foo",
        aProperty: "new-value",
        anotherProperty: ["another-existing-value", "another-new-value"],
      },
    ]);
  });

  it("simply inserts subjects without an @id", async () => {
    const meld = await testClone({
      "@id": "foo",
      aProperty: "existing-value",
      anotherProperty: "another-existing-value",
    });

    await meld.write(
      upsert(
        [
          {
            aProperty: "new-value",
            anotherProperty: "another-new-value",
          },
        ],
        ["aProperty"],
      ),
    );

    expect(await readAll(meld)).toMatchObject([
      {
        aProperty: "new-value",
        anotherProperty: "another-new-value",
      },
      {
        "@id": "foo",
        aProperty: "existing-value",
        anotherProperty: "another-existing-value",
      },
    ]);
  });

  // This test exercises a pitfall in the logic, where the read to get the
  // existing data can fail if the pattern requires every property to have a
  // value.
  it("works even if not every value exists already", async () => {
    const meld = await testClone({
      "@id": "foo",
      aProperty: "existing-value",
    });

    await meld.write(
      upsert(
        [
          {
            "@id": "foo",
            aProperty: "new-value",
            anotherProperty: "another-new-value",
          },
        ],
        ["aProperty", "anotherProperty"],
      ),
    );

    expect(await readAll(meld)).toEqual([
      {
        "@id": "foo",
        aProperty: "new-value",
        anotherProperty: "another-new-value",
      },
    ]);
  });
});
