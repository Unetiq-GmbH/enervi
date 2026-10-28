import { createContext } from "react";
import { User } from "../types";

interface UserContextType {
  user: User | null;
}

const UserContext = createContext<UserContextType>({ user: null });

export default UserContext;
