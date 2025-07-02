import { z } from "zod";

export const createRestaurantSchema = z.object({
  restaurantName: z.string().min(1, "Restaurant name is required"),
  slug: z.string().min(3, "Slug must be at least 3 characters long").max(20, "Slug must not exceed 20 characters long").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and can only contain letters, numbers, and hyphens"),
  description: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().url("Invalid URL format").optional(),
});
