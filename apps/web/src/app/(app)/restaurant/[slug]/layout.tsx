"use client";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "@/utils/axiosInstance";
import { setActiveRestaurant } from "@/store/restaurantSlice";
import { AppDispatch } from "@/store/store";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";

export default function Layout({ children }: { children: React.ReactNode }) {
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

  return <>{children}</>;
}
