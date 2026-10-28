import { ReactNode } from "react";
import NotificationContext from "../contexts/NotificationContext";
import { useNotification } from "../hooks/useNotification";

export default function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    imageManipulationFinishedNotification,
    showImageManipulationFinishedNotification,
  } = useNotification();

  return (
    <NotificationContext.Provider
      value={{
        imageManipulationFinishedNotification,
        showImageManipulationFinishedNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
