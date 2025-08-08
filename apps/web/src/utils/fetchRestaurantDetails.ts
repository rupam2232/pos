import type { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import axios from "@/utils/axiosInstance";
import { toast } from "sonner";

export async function fetchRestaurantDetails(slug: string) {
  try {
    const response = await axios.get(`/restaurant/${slug}`);
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    console.error(
      "Failed to fetch restaurant details. Please try again later:",
      error
    );
    toast.error(
      axiosError.response?.data.message ||
        "Failed to fetch restaurant details. Please try again later"
    );
  }
}