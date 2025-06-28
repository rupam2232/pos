import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
  //   .refine((val, ctx) => {
  //     if (val !== ctx.parent.password) {
  //       ctx.addIssue({
  //         code: z.ZodIssueCode.custom,
  //         message: "Passwords do not match",
  //       });
  //       return false;
  //     }
  //     return true;
  //   }),
  // })
  otp: z.string().min(6, "OTP must be 6 digits long"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
});
