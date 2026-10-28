import { io } from "socket.io-client";

const URL = import.meta.env.VITE_REACT_APP_URL;

// TODO: Delete this after testing on production
console.log({ socketURL: URL });

export const socket = io(URL);
