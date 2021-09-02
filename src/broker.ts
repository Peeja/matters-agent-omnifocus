import aedes from "aedes";
import { createServer } from "net";

const aedesInstance = aedes();
const server = createServer(aedesInstance.handle);
const port = 1883;

server.listen(port, () => {
  console.log("MQTT broker started and listening on port ", port);
  process.send && process.send("started");
});

aedesInstance.on("client", (client) => {
  console.log("MQTT client connected", client.id);
});
