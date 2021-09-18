import http from "http";
import socket from "socket.io";
import express from "express";
import { IoRemotesService } from "@m-ld/m-ld/dist/socket.io/server";

const app = express();
const httpServer = http.createServer(app);

// Start the Socket.io server, and attach the m-ld message-passing service
const io = new socket.Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

new IoRemotesService(io.sockets)
  // The m-ld service provides some debugging information
  .on("error", console.error)
  .on("debug", console.debug);

const port = 4000;
httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  process.send && process.send("started");
});
