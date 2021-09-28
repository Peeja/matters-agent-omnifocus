import { upsert } from "./upsert";
import { mock } from "jest-mock-extended";
import { MeldRemotes } from "@m-ld/m-ld/dist/engine";
import { clone, MeldConfig, MeldReadState, Subject } from "@m-ld/m-ld";
import MemDown from "memdown";
import { asapScheduler, BehaviorSubject, from, observeOn } from "rxjs";
import { sortBy } from "lodash";

function mockRemotes(): MeldRemotes {
  return {
    ...mock<MeldRemotes>(),
    setLocal: () => {
      /* noop */
    },
    live: hotLive([false]),
  };
}

function hotLive(
  lives: Array<boolean | null>,
): BehaviorSubject<boolean | null> {
  const live = new BehaviorSubject(lives[0]);
  void from(lives.slice(1))
    .pipe(observeOn(asapScheduler))
    .forEach((v) => live.next(v));
  return live;
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
      upsert([
        {
          "@id": "http://www.example.com/foo",
          aProperty: "new-value",
        },
      ]),
    );

    expect(await readAll(meld)).toEqual([
      { "@id": "http://www.example.com/foo", aProperty: "new-value" },
    ]);
  });

  it("updates when there is an existing value", async () => {
    const meld = await testClone({
      "@id": "http://www.example.com/foo",
      aProperty: "existing-value",
    });

    await meld.write(
      upsert([
        {
          "@id": "http://www.example.com/foo",
          aProperty: "new-value",
        },
      ]),
    );

    expect(await readAll(meld)).toEqual([
      { "@id": "http://www.example.com/foo", aProperty: "new-value" },
    ]);
  });

  it("leaves other subjects' properties alone", async () => {
    const meld = await testClone([
      {
        "@id": "http://www.example.com/foo",
        aProperty: "existing-value",
      },
      {
        "@id": "http://www.example.com/bar",
        aProperty: "another-existing-value",
      },
    ]);

    await meld.write(
      upsert([
        {
          "@id": "http://www.example.com/foo",
          aProperty: "new-value",
        },
      ]),
    );

    expect(await readAll(meld)).toEqual([
      {
        "@id": "http://www.example.com/bar",
        aProperty: "another-existing-value",
      },
      {
        "@id": "http://www.example.com/foo",
        aProperty: "new-value",
      },
    ]);
  });
});
