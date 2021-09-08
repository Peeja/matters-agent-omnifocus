declare module "@rmlio/yarrrml-parser/lib/rml-generator" {
  import { Quad } from "rdf-js";

  class Yarrrml {
    convert(yaml: string): Quad[];
  }
  export = Yarrrml;
}
