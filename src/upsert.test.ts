import { upsert } from "./upsert";
import { mock } from "jest-mock-extended";
import { MeldRemotes } from "@m-ld/m-ld/dist/engine";
import { clone, MeldConfig, Subject } from "@m-ld/m-ld";
import MemDown from "memdown";
import { asapScheduler, BehaviorSubject, from, observeOn } from "rxjs";

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

    expect(
      await meld.read({
        "@describe": "?id",
        "@where": { "@id": "?id" },
      }),
    ).toEqual([
      { "@id": "http://www.example.com/foo", aProperty: "new-value" },
    ]);
  });
});
