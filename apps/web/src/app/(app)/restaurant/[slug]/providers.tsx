"use client";

import { useEffect, useRef } from "react";
import { AppDispatch, RootState } from "@/store/store";
import { setActiveRestaurant } from "@/store/restaurantSlice";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import axios from "@/utils/axiosInstance";
import * as orderSound from "@/utils/orderSound";

export function Providers({ children }: { children: React.ReactNode }) {
  const activeRestaurant = useSelector(
    (state: RootState) => state.restaurantsSlice.activeRestaurant
  );
  const socket = useSocket();
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const connectHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const response = await axios.get(`/restaurant/${slug}`);
        if (response.data.success) {
          dispatch(setActiveRestaurant(response.data.data));
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error(
          axiosError.response?.data.message || "Failed to fetch restaurant data"
        );
      }
    })();
  }, [slug, dispatch]);

  useEffect(() => {
    if (!socket || !activeRestaurant?._id) return;

    // ensure removing any previous handlers on same socket instance
    if (connectHandlerRef.current) {
      socket.off("connect", connectHandlerRef.current);
      connectHandlerRef.current = null;
    }

    const handleConnect = () => {
      socket.emit("authenticate", activeRestaurant._id);
      console.log(
        "Emitted authenticate event with restaurant ID:",
        activeRestaurant._id,
        socket.id
      );
    };

    connectHandlerRef.current = handleConnect;

    // If already connected, emit immediately
    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    const newOrderHandler = (data: { message: string; order: { orderNo: string } }) => {
      // Show browser notification
      if (Notification.permission === "granted") {

        toast.success(data.message);
        new Notification("New Order", {
          tag: "newOrder", // Prevent multiple notifications
          body: `You have a new order #${data.order.orderNo}`,
          icon: activeRestaurant.logoUrl ?? "/favicon.ico",
        });
      } else {
        toast.success(data.message, {
          action: {
            label: "Notify",
            onClick: () =>
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                  new Notification("New Order", {
                    tag: "newOrder",
                    body: `You have a new order #${data.order.orderNo}`,
                    icon: activeRestaurant.logoUrl ?? "/favicon.ico",
                  });
                }
              }),
          },
        });
      }
      // Play sound notification
      orderSound.play();
    }

    socket.off("newOrder", newOrderHandler); // Remove any existing handlers to prevent duplicates
    socket.on("newOrder", newOrderHandler);

    return () => {
      if (connectHandlerRef.current) {
        socket.off("connect", connectHandlerRef.current);
        connectHandlerRef.current = null;
      }
      socket.off("newOrder", newOrderHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRestaurant?._id, socket]);

  return <>{children}</>;
}
