import { memoize } from "lodash";
import YarrrmlParser from "@rmlio/yarrrml-parser/lib/rml-generator";

import { Writer as N3Writer } from "n3";

import rocketrml from "rocketrml";
import { Subject } from "@m-ld/m-ld";
import {
  isPropertyObject,
  isValueObject,
  SubjectPropertyObject,
} from "json-rql";

const yaml = `
prefixes:
  omnifocus: http://peeja.com/purl/matters/omnifocus/
mappings:
  task:
    sources:
      - ["input~xpath", "/omnifocus/task"]

    subjects: "omnifocus:task/$(./@id)"
    predicateobjects:
      - predicates: omnifocus:o/name
        objects:
          value: "$(./name)"
      - predicates: omnifocus:o/note
        objects:
          value: "$(./note)"
      - predicates: omnifocus:o/added
        objects:
          value: "$(./added)"
          datatype: xsd:dateTime
      - predicates: omnifocus:o/modified
        objects:
          value: "$(./modified)"
          datatype: xsd:dateTime
      - predicates: omnifocus:o/completed
        objects:
          value: "$(./completed)"
          datatype: xsd:dateTime
`;

const yarrrmlParse = memoize(
  (yaml: string) =>
    new Promise<string>((resolve) => {
      const y2r = new YarrrmlParser();
      const yamlQuads = y2r.convert(yaml);
      const writer = new N3Writer();
      writer.addQuads(yamlQuads);
      writer.end((_, result: string) => {
        resolve(result);
      });
    }),
);

/**
 * An entity to conventionally represent a "null" dateTime. Notably used as the
 * completed time of a task which is incomplete, or more generally as the
 * timestamp of an event which has not occurred.
 */
const NEVER_TIME = {
  "@id": "http://peeja.com/purl/matters/omnifocus/o/never",
};

/**
 * True if the given object represents a "null" dateTime value in the RML
 * engine's results. Specifically, true if the object is an `xsd:dateTime` with
 * an empty string as the value. This is how the RML engine will return dateTime
 * values which are missing, such as from `<completed />`, which is how
 * OmniFocus affirmatively represents an incomplete task.
 */
const isNeverTime = (object: SubjectPropertyObject) =>
  isValueObject(object) &&
  object["@type"] === "http://www.w3.org/2001/XMLSchema#dateTime" &&
  object["@value"] === "";

export const parseOmniFocusXML = async (
  updateXML: string,
): Promise<Subject[]> => {
  const rmlEngineResult = await (rocketrml.parseFileLive(
    await yarrrmlParse(yaml),
    { input: updateXML },
    { xpathLib: "fontoxpath" },
  ) as Promise<Subject[]>);

  return rmlEngineResult.map((a) =>
    Object.fromEntries(
      Object.entries(a).map(([k, v]) => [
        k,
        isPropertyObject(k, v) && isNeverTime(v) ? NEVER_TIME : v,
      ]),
    ),
  );
};
