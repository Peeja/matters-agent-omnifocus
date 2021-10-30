import { memoize } from "lodash";
import YarrrmlParser from "@rmlio/yarrrml-parser/lib/rml-generator";

import { Writer as N3Writer } from "n3";

import rocketrml from "rocketrml";
import { Subject } from "@m-ld/m-ld";

const yaml = `
prefixes:
  omnifocus: http://peeja.com/purl/matters/omnifocus/
mappings:
  person:
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
          datatype: xsd:dateTimeStamp
      - predicates: omnifocus:o/modified
        objects:
          value: "$(./modified)"
          datatype: xsd:dateTimeStamp
      - predicates: omnifocus:o/completed
        objects:
          value: "$(./completed)"
          datatype: xsd:dateTimeStamp
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

export const parseOmniFocusXML = async (
  updateXML: string,
): Promise<Subject[]> =>
  rocketrml.parseFileLive(
    await yarrrmlParse(yaml),
    { input: updateXML },
    { xpathLib: "fontoxpath" },
  ) as Promise<Subject[]>;
