import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { User } from "../types";
import axios from "axios";
import { setStorage } from "../utils/storage";

const audience = import.meta.env.VITE_REACT_APP_AUTH0_AUDIENCE;

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const {
    user: authUser,
    isAuthenticated,
    getAccessTokenSilently,
  } = useAuth0();

  useEffect(() => {
    async function getUserData(userEmail: string) {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience,
        },
      });

      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_URL}/api/user`,
        {
          params: { email: userEmail },
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      return {
        ...response.data,
        accessToken,
      };
    }

    if (isAuthenticated && authUser?.email) {
      getUserData(authUser.email).then((response: User) => {
        setUser(response);
        setStorage("user", JSON.stringify(response));
      });
    } else {
      setUser(null);
    }
  }, [isAuthenticated, authUser, setUser, getAccessTokenSilently]);

  return { user };
}
