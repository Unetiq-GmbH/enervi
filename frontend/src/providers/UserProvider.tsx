import { ReactNode } from "react";
import UserContext from "../contexts/UserContext";
import { useUser } from "../hooks/useUser";

export default function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}
