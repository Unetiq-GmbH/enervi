import { RouterProvider } from "react-router-dom";

import NotificationProvider from "./providers/NotificationProvider";
import UserProvider from "./providers/UserProvider";

import "./App.scss";
import router from "./routes";

function App() {
  return (
    <NotificationProvider>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </NotificationProvider>
  );
}

export default App;
