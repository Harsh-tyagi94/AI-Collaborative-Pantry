import { z } from "zod";

export const registerUserSchema = z.object({
  username: z.string().min(3, "Username must be atleast 3 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be atleast 6 characters"),
});

export const loginUserSchema = z.object({
  email: z.email(),
  password: z.string().min(4),
});

export type RegisterUserFormData = z.infer<typeof registerUserSchema>;
export type LoginUserFormData = z.infer<typeof loginUserSchema>;
