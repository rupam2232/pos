import { getSocket } from "@/utils/socket";
import { useEffect } from "react";

export function useOrderNotifications(
  orderId: string,
  onNotify: (msg: string) => void
) {
  useEffect(() => {
    if (!orderId) return;

    const socket = getSocket();

    socket.emit("joinOrderRoom", orderId);

    const handler = (data: { message: string }) => {
      onNotify(data.message);
    };

    socket.on(`order_${orderId}`, handler);

    return () => {
      socket.off(`order_${orderId}`, handler);
      socket.emit("leaveOrderRoom", orderId);
    };
  }, [orderId, onNotify]);
}
