const SocketEvents = Object.freeze({
  connection: "connection",
  disconnect: "disconnect",

  createGroupForImageManipulation: "createGroupForImageManipulation",
  imageManipulationFinished: "imageManipulationFinished",
  imageManipulationFailed: "imageManipulationFailed",
});

export default SocketEvents;
