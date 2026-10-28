import SocketEvents from "../socketEvents";
import { Socket } from "socket.io";

const onConnection = (socket: Socket): void => {
  socket.on(SocketEvents.createGroupForImageManipulation, (room: string) => {
    socket.join(room);
  });

  socket.on(SocketEvents.disconnect, () => {});
};

export default onConnection;
