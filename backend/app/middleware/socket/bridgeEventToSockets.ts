import eventEmitter from "../event";
import { Server } from "socket.io";
import SocketEvents from "./socketEvents";

function bridgeEventsToSocket(io: Server) {
  eventEmitter.on(SocketEvents.imageManipulationFinished, (room: string) => {
    io.to(room).emit(SocketEvents.imageManipulationFinished, room);
  });

  eventEmitter.on(SocketEvents.imageManipulationFailed, (room: string) => {
    io.to(room).emit(SocketEvents.imageManipulationFailed, room);
  });
}

export default bridgeEventsToSocket;
