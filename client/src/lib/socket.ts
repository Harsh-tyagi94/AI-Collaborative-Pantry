import { webSocketURL } from "@/constants/constant";
import { io } from "socket.io-client";

export const socket = io(webSocketURL, {
  withCredentials: true,
  autoConnect: true,
});