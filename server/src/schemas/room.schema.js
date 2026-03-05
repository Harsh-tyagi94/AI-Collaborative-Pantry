import { z } from "zod";

const createRoomSchema = z.object({
    roomName: z.string().min(3, "Room name must be at least 3 characters long"),
});

const ingredientSchema = z.object({
    ingredient: z.string().min(2, "Ingredient must be at least 2 characters").max(50, "Ingredient name too long")
});

const joinRoomSchema = z.object({
    // We validate params in the route, but if you had a password for the room, it would go here.
});


export { createRoomSchema, 
    ingredientSchema, 
}