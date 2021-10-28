import { parseOmniFocusXML } from "./parseOmniFocusXML";

const UPDATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<omnifocus xmlns="http://www.omnigroup.com/namespace/OmniFocus/v2" app-id="com.omnigroup.OmniFocus3" app-version="149.14.0" os-name="Mac OS X" os-version="11.5.2" machine-model="MacBookPro15,1">
  <task id="nh9Aywg0cTm">
    <project>
      <folder idref="l-gRwKPN-2e"/>
      <singleton>true</singleton>
      <last-review>2018-12-08T05:00:00.000Z</last-review>
      <next-review>2018-12-15T05:00:00.000Z</next-review>
      <review-interval>@1w</review-interval>
      <status>active</status>
    </project>
    <inbox>false</inbox>
    <task/>
    <added>2018-12-08T18:24:03.897Z</added>
    <name>A project</name>
    <note/>
    <rank>2013265920</rank>
    <context/>
    <start/>
    <due/>
    <completed/>
    <estimated-minutes/>
    <order>parallel</order>
    <flagged>false</flagged>
    <completed-by-children>false</completed-by-children>
    <repetition-rule/>
    <repetition-method/>
    <next-clone-identifier>0</next-clone-identifier>
    <due-date-alarm-policy/>
    <defer-date-alarm-policy/>
    <latest-time-to-start-alarm-policy/>
    <modified>2019-12-18T03:14:59.624Z</modified>
    <hidden/>
  </task>

  <task id="fK1_kWpTQU0">
    <project/>
    <inbox>false</inbox>
    <task idref="iObjZ-8Jsvw"/>
    <added>2018-12-11T21:07:36.174Z</added>
    <name>Just a task</name>
    <note/>
    <rank>-1370173634</rank>
    <context/>
    <start>2021-09-25T04:00:00.000Z</start>
    <due>2021-09-26T02:00:00.000Z</due>
    <completed/>
    <estimated-minutes/>
    <order>parallel</order>
    <flagged>false</flagged>
    <completed-by-children>false</completed-by-children>
    <repetition-rule>FREQ=WEEKLY;BYDAY=SA</repetition-rule>
    <repetition-method>fixed</repetition-method>
    <next-clone-identifier>150</next-clone-identifier>
    <due-date-alarm-policy/>
    <defer-date-alarm-policy/>
    <latest-time-to-start-alarm-policy/>
    <modified>2021-09-20T02:28:51.922Z</modified>
  </task>
</omnifocus>
`;

describe("parseOmniFocusXML()", () => {
  it("parses OmniFocus XML", async () => {
    const updateXML = UPDATE_XML;
    const tasks = await parseOmniFocusXML(updateXML); //?
    console.log(tasks);
    expect(tasks).toStrictEqual([]);
  });
});
