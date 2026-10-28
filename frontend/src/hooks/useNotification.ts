import { useState, useEffect } from "react";
import { socket } from "../socket/socket";
import SocketEvents from "../enums/SocketEvents";

export function useNotification() {
  const scenarioCompleted = localStorage.getItem("scenarioCompleted");
  const [
    imageManipulationFinishedNotification,
    setImageManipulationFinishedNotification,
  ] = useState(scenarioCompleted === "true");

  useEffect(() => {
    const handleImageManipulationFailed = () => {
      localStorage.setItem("scenarioCompleted", "true");
      document.title = `(Neue Nachricht)\nEnerVi`;
      setImageManipulationFinishedNotification(true);
    };

    const handleImageManipulationFinished = () => {
      localStorage.setItem("scenarioCompleted", "true");
      document.title = `(Neue Nachricht)\nEnerVi`;
      setImageManipulationFinishedNotification(true);
    };

    socket.on(
      SocketEvents.imageManipulationFinished,
      handleImageManipulationFinished
    );
    socket.on(
      SocketEvents.imageManipulationFailed,
      handleImageManipulationFailed
    );

    return () => {
      socket.off(
        SocketEvents.imageManipulationFinished,
        handleImageManipulationFinished
      );
      socket.off(
        SocketEvents.imageManipulationFailed,
        handleImageManipulationFailed
      );
    };
  }, []);

  return {
    imageManipulationFinishedNotification,
    showImageManipulationFinishedNotification:
      setImageManipulationFinishedNotification,
  };
}
