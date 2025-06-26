import {z} from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});