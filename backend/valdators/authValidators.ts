import { z } from "zod";

export const registerSchema = z
   .object({
      email: z.email("Invalid email format"),
      fullName: z.string().min(2, "Full name must be at least 2 characters"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      passwordAgain: z.string(),
   })
   .refine((data) => data.password === data.passwordAgain, {
      message: "Passwords do not match",
      path: ["passwordAgain"],
   });

export const loginSchema = z.object({
   email: z.email("Invalid email format"),
   password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
