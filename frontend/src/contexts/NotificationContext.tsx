import { createContext } from "react";

interface NotificationContextType {
  imageManipulationFinishedNotification: boolean;
  showImageManipulationFinishedNotification: (value: boolean) => void;
}

const UserContext = createContext<NotificationContextType>({
  imageManipulationFinishedNotification: false,
  showImageManipulationFinishedNotification: () => {},
});

export default UserContext;
