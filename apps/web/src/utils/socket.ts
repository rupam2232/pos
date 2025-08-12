import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_BASE_URL;

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    if (!SOCKET_URL) {
      throw new Error("Socket URL is not defined");
    }
    socket = io(SOCKET_URL, { withCredentials: true });
    console.log(socket)
  }
  return socket;
}
