import { z } from "zod";

export const createRestaurantSchema = z.object({
  restaurantName: z.string().min(1, "Restaurant name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().url("Invalid URL format").optional(),
});
