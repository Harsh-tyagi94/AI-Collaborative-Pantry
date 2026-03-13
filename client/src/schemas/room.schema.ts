import { z } from "zod";

export const createRoomSchema = z.object({
  roomName: z
    .string()
    .min(3, "Room name must be at least 3 characters")
    .max(30, "Room name must be less than 30 characters")
    .trim()
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Only letters, numbers, hyphens, and underscores allowed",
    ),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
