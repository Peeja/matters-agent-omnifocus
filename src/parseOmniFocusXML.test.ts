import { parseOmniFocusXML } from "./parseOmniFocusXML";

const UPDATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<omnifocus xmlns="http://www.omnigroup.com/namespace/OmniFocus/v2" app-id="com.omnigroup.OmniFocus3" app-version="149.14.0" os-name="Mac OS X" os-version="11.5.2" machine-model="MacBookPro15,1">
  <task id="fXca4j_fZ0u" op="update">
    <project>
      <folder/>
      <singleton>false</singleton>
      <last-review>2021-08-29T04:00:00.000Z</last-review>
      <next-review/>
      <review-interval>@1w</review-interval>
      <status>active</status>
    </project>
    <inbox>false</inbox>
    <task/>
    <added>2021-08-30T00:36:48.969Z</added>
    <modified>2021-09-04T18:38:40.938Z</modified>
  </task>
  <task id="caBiNoe5uak" op="update">
    <added>2021-08-30T00:37:23.278Z</added>
    <modified>2021-09-04T18:38:40.938Z</modified>
    <completed>2021-09-04T18:38:40.920Z</completed>
  </task>
</omnifocus>
`;

describe("parseOmniFocusXML()", () => {
  it("parses OmniFocus XML", async () => {
    const updateXML = UPDATE_XML;
    const tasks = await parseOmniFocusXML(updateXML);
    expect(tasks).toStrictEqual([
      {
        "@id": "http://peeja.com/purl/matters/omnifocus/task/fXca4j_fZ0u",
        "http://peeja.com/purl/matters/omnifocus/o/added": {
          "@type": "http://www.w3.org/2001/XMLSchema#dateTimeStamp",
          "@value": "2021-08-30T00:36:48.969Z",
        },
        "http://peeja.com/purl/matters/omnifocus/o/modified": {
          "@type": "http://www.w3.org/2001/XMLSchema#dateTimeStamp",
          "@value": "2021-09-04T18:38:40.938Z",
        },
      },
      {
        "@id": "http://peeja.com/purl/matters/omnifocus/task/caBiNoe5uak",
        "http://peeja.com/purl/matters/omnifocus/o/added": {
          "@type": "http://www.w3.org/2001/XMLSchema#dateTimeStamp",
          "@value": "2021-08-30T00:37:23.278Z",
        },
        "http://peeja.com/purl/matters/omnifocus/o/completed": {
          "@type": "http://www.w3.org/2001/XMLSchema#dateTimeStamp",
          "@value": "2021-09-04T18:38:40.920Z",
        },
        "http://peeja.com/purl/matters/omnifocus/o/modified": {
          "@type": "http://www.w3.org/2001/XMLSchema#dateTimeStamp",
          "@value": "2021-09-04T18:38:40.938Z",
        },
      },
    ]);
  });
});
