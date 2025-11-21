import { useCallback, useEffect, useRef } from "react";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import * as orderSound from "@/utils/orderSound";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

/**
 * Hook that registers a stable `newOrder` listener on the global socket.
 * It shows a toast, a browser notification (if permission granted), and plays a sound.
 * The listener is cleaned up automatically when the component unmounts or the socket changes.
 */
export function useNewOrderListener() {
  const socket = useSocket();
  const activeRestaurant = useSelector(
    (state: RootState) => state.restaurantsSlice.activeRestaurant
  );

  const restaurantRef = useRef(activeRestaurant);
  useEffect(() => {
    restaurantRef.current = activeRestaurant;
  }, [activeRestaurant]);

  const newOrderHandler = useCallback(
    (data: { message: string; order: { orderNo: string } }) => {
      const restaurant = restaurantRef.current;

      // Show browser notification if allowed
      const showNotification = () => {
        new Notification("New Order", {
          tag: "newOrder",
          body: `You have a new order #${data.order.orderNo}`,
          icon: restaurant?.logoUrl ?? "/favicon.ico",
        });
      };

      if (Notification.permission === "granted") {
        toast.success(data.message);
        showNotification();
      } else {
        toast.success(data.message, {
          action: {
            label: "Notify",
            onClick: () => {
              Notification.requestPermission().then((perm) => {
                if (perm === "granted") showNotification();
              });
            },
          },
        });
      }

      // Play sound notification
      orderSound.play();
    },
    []
  );

  useEffect(() => {
    if (!socket) return;
    socket.on("newOrder", newOrderHandler);
    return () => {
      socket.off("newOrder", newOrderHandler);
    };
  }, [socket, newOrderHandler]);
}
