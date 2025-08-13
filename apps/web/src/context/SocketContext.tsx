"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_BASE_URL!;

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (socket) {
      console.warn("Socket already initialized");
      return;
    }
    const newSocket = io(SOCKET_URL, { withCredentials: true });
    setSocket(newSocket);

    newSocket.on("connect", () =>
      console.log("Socket connected!", newSocket.id)
    );
    newSocket.on("disconnect", () =>
      console.log("Socket disconnected!")
    );
    newSocket.on("connect_error", (err) =>
      console.error("Socket connection error:", err.message)
    );

    return () => {
        newSocket.off("connect");
        newSocket.off("disconnect");
        newSocket.off("connect_error");
        newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
