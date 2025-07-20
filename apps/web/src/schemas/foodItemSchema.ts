import { z } from "zod";

export const foodItemSchema = z.object({
  foodName: z
    .string()
    .min(1, "Food name is required")
    .max(50, "Food name cannot exceed 50 characters")
    .trim(),
  price: z.number({message: "Price must be a positive number"}).min(0, "Price must be a positive number"),
  discountedPrice: z
    .number({message: "Discounted price must be a positive number"})
    .min(0, "Discounted price must be a positive number")
    .optional(),
  hasVariants: z.boolean().optional(),
  variants: z.array(
    z.object({
      variantName: z
        .string()
        .min(1, "Variant name is required")
        .max(50, "Variant name cannot exceed 50 characters")
        .trim(),
      price: z.number({message: "Variant price must be a positive number"}).min(0, "Variant price must be a positive number"),
      discountedPrice: z
        .number({message: "Variant discounted price must be a positive number"})
        .min(0, "Variant discounted price must be a positive number")
        .optional(),
      description: z
        .string()
        .max(200, "Variant description cannot exceed 200 characters")
        .trim()
        .optional(),
    })
  ),
  imageUrls: z.array(z.string().url("Invalid image URL")).optional(),
  category: z.string().trim().optional(),
  foodType: z
    .string()
    .min(1, "Food type is required")
    .max(20, "Food type cannot exceed 20 characters"),
  description: z
    .string()
    .max(200, "Description cannot exceed 200 characters")
    .trim()
    .optional(),
  tags: z
    .array(
      z
        .string()
        .min(1, "Tag cannot be empty")
        .max(30, "Tag cannot exceed 30 characters")
        .trim()
    )
    .optional(),
});
