import { z } from "zod";

export const createRestaurantSchema = z.object({
  restaurantName: z.string().min(1, "Restaurant name is required").trim(),
  slug: z.string().trim().min(3, "Slug must be at least 3 characters long").max(20, "Slug must not exceed 20 characters long").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and can only contain letters, numbers, and hyphens"),
  description: z.string().trim().optional(),
  address: z.string().trim().optional(),
  logoUrl: z.string().trim().url("Invalid URL format").optional(),
});

export const addCategorySchema = z.object({
  category: z.string().min(1, "Category name is required").max(40, "Category name must not exceed 40 characters").trim(),
});