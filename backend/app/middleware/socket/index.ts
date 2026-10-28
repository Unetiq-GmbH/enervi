import http from "http";
import { Server } from "socket.io";
import express from "express";
import socketIoOptions from "./socketIoOptions";
import onConnection from "./event/onConnection";

const setupSocket = (
  app: express.Application
): { server: http.Server; io: Server } => {
  const server = http.createServer(app);
  const io = new Server(server, socketIoOptions);

  io.on("connection", onConnection);

  return { server, io };
};

export default setupSocket;
