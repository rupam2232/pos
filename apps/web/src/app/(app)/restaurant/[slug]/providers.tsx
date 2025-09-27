"use client";

import { useEffect } from "react";
import { AppDispatch, RootState } from "@/store/store";
import { setActiveRestaurant } from "@/store/restaurantSlice";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import axios from "@/utils/axiosInstance";

export function Providers({ children }: { children: React.ReactNode }) {
  const activeRestaurantId = useSelector(
    (state: RootState) => state.restaurantsSlice.activeRestaurant?._id
  );
  const socket = useSocket();
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch<AppDispatch>();

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
    if (!socket || !activeRestaurantId) return;
    const handleConnect = () => {
      socket.emit("authenticate", activeRestaurantId);
      console.log(
        "Emitted authenticate event with restaurant ID:",
        activeRestaurantId,
        socket.id
      );
    };

    // If already connected, emit immediately
    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);

      socket.on("newOrder", (data) => {
        toast.success(data.message);
      });
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("newOrder");
    };
  }, [activeRestaurantId, socket]);

  return <>{children}</>;
}
