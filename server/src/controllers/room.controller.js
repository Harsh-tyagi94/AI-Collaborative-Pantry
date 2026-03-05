import { redisClient } from "../db/index.js";
import { Room } from "../models/room.model.js";
import { generateRecipeFromIngredients } from "../utils/aiService.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { nanoid } from "nanoid";


const createRoom = asyncHandler(async (req, res) => {
    // 1. Validation (Optional room name, but admin is mandatory)
    // 2. Generate a unique 10-character Room ID
    // 3. Create the room entry in MongoDB
    // Auto-join the admin as the first member in redis database


    const { roomName } = await req.body

    if(!req.user?._id) {
        throw new ApiError(401, "You must be logged in to create a room");
    }

    const roomId = nanoid(10)

    const room = await Room.create({
        roomId: roomId,
        roomName: roomName || `${req.user.username}'s Kitchen`,
        admin: req.user._id,
    });

    if(!room) {
        throw new ApiError(500, "Something went wrong while creating the room");
    }

    const membersKey = `room:members:${room.roomId}`;
    await redisClient.sadd(membersKey, req.user.username);
    await redisClient.expire(membersKey, 86400);

    return res
        .status(201)
        .json(
            new ApiResponse(201, room, "Room created successfully")
        );
});

const joinRoom = asyncHandler(async (req, res) => {
    // 1. Check MongoDB to see if the room exists
    // 2. Authorization Check: Is user already a member?
    // 3. Redis Bookkeeping: Add user to the "Active Participants" Set
    // We use a Redis SET because it automatically handles unique values.

    const { roomId } = await req.params;
    const room = await Room.findOne({ roomId })
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    if (!room.isActive) {
        throw new ApiError(400, "This room has been closed");
    }

    const membersKey = `room:members:${roomId}`;
    const isAlreadyMember = await redisClient.sismember(membersKey, req.user.username);

    if (isAlreadyMember) {
        return res
            .status(200)
            .json(new ApiResponse(200, { room }, "You are already a member of this room"));
    }

    await redisClient.sadd(membersKey, req.user.username);
    await redisClient.expire(membersKey, 86400);

    // SOCKET BROADCAST: Tell the room a new chef arrived
    const io = req.app.get("io");
    
    io.to(roomId).emit("participant_joined", {
        username: req.user.username,
        message: `${req.user.username} has joined the kitchen!`
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {
            room,
            message: "Successfully joined the kitchen"
        }));
})

const addIngredient = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { ingredient } = await req.body;

    // 1. Authorization Check: Is this user actually in the room?
    // 2. We create a unique key for this room's pantry
    // 3. Add to Redis Set (SADD) and check if it was added or already existed return response
    // This happens in memory - it's lightning fast!
    // 4. Keep the pantry alive for 24 hours
    // 5. SOCKET.IO BROADCAST (The New Part) also Emit 'ingredient_added' event to everyone in the room
    // 6. Return the updated count or just a success

    const membersKey = `room:members:${roomId}`;
    const isMember = await redisClient.sismember(membersKey, req.user.username);

    if (!isMember) {
        throw new ApiError(403, "You must join this room before adding ingredients");
    }

    if (!ingredient || ingredient.trim() === "") {
        throw new ApiError(400, "Ingredient name is required");
    }

    const pantryKey = `pantry:${roomId}`;
    const normalizedIngredient = ingredient.toLowerCase().trim();

    const addedCount = await redisClient.sadd(pantryKey, normalizedIngredient);
    if (addedCount === 0) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "Ingredient already added to pantry"));
    }

    await redisClient.expire(pantryKey, 86400);

    const io = req.app.get("io");
    io.to(roomId).emit("ingredient_added", {
        ingredient: normalizedIngredient,
        addedBy: req.user.username
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { ingredient: normalizedIngredient }, "Ingredient added to pantry"));
});

const removeIngredient = asyncHandler(async (req, res) => {
    const { roomId } = req.params
    const { ingredient } = await req.body

    if (!ingredient) {
        throw new ApiError(400, "Ingredient name is required for removal");
    }

    const membersKey = `room:members:${roomId}`;
    const isMember = await redisClient.sismember(membersKey, req.user.username);

    if (!isMember) {
        throw new ApiError(403, "You do not have permission to edit this pantry");
    }

    const pantryKey = `pantry:${roomId}`;
    const normalizedIngredient = ingredient.toLowerCase().trim();
    
    const removedCount = await redisClient.srem(pantryKey, normalizedIngredient);

    if (removedCount === 0) {
        throw new ApiError(404, "Ingredient not found in the pantry");
    }

    const io = req.app.get("io");
    io.to(roomId).emit("ingredient_removed", {
        ingredient: normalizedIngredient,
        removedBy: req.user.username
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { ingredient: normalizedIngredient }, "Ingredient removed from pantry"));
});

const getPantryIngredients = asyncHandler(async (req,res) => {
    const { roomId } = req.params;

    // 1. Verify the room exists in MongoDB
    // 2. Authorization Check
    // 3. Fetch all ingredients from Redis using smembers command
    // 4. Return the list (it will be of type array)
    const room = await Room.findOne({ roomId })
    if(!room) {
        throw new ApiError(404, "Room not found")
    }

    const membersKey = `room:members:${roomId}`;
    const isMember = await redisClient.sismember(membersKey, req.user.username);

    if (!isMember) {
        throw new ApiError(403, "Access denied. You are not a participant of this room");
    }

    const pantryKey = `pantry:${roomId}`;
    const ingredients = await redisClient.smembers(pantryKey);

    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            { 
                ingredients, 
                count: ingredients.length 
            }, 
            "Pantry fetched successfully"
        ));
})

const generateRecipe = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    // 1. Fetch Room to check ownership
    // 2. ADMIN CHECK: Compare the room's admin ID with the current user's ID
    // 3. Fetch Ingredients from Redis
    // 4. Call the AI Service magic happens
    // 5. BROADCAST: dish to everyone!

    const room = await Room.findOne({ roomId });
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    if (room.admin.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the Room Admin (Chef) can generate the recipe");
    }

    const pantryKey = `pantry:${roomId}`;
    const ingredients = await redisClient.smembers(pantryKey);

    if (ingredients.length === 0) {
        throw new ApiError(400, "The pantry is empty! Add ingredients before cooking.");
    }

    const recipe = await generateRecipeFromIngredients(ingredients);

    room.generatedRecipe = recipe;
    room.finalIngredients = ingredients;
    await room.save();

    req.app.get("io").to(roomId).emit("recipe_generated", {
        recipe,
        generatedBy: req.user.username
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { recipe }, "Recipe generated successfully"));
});

const closeRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    // 1. Fetch room & Verify Admin
    const room = await Room.findOne({ roomId });
    if (!room) throw new ApiError(404, "Room not found");

    if (room.admin.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the Chef (Admin) can close the kitchen");
    }

    // 2. GET THE FULL REGISTRY (Everyone who ever joined)
    const pantryKey = `pantry:${roomId}`;
    const membersKey = `room:members:${roomId}`;
    const onlineMembersKey = `room:online:${roomId}`;
    const allSessionMembers = await redisClient.smembers(membersKey);

    // Archive participants to MongoDB
    const roomArchived = await Room.findOneAndUpdate(
        { roomId },
        { 
            participants: allSessionMembers, 
            isActive: false 
        },
        { new: true }
    );

    // 4. REDIS CLEANUP (Memory Management)
    await redisClient.del(pantryKey, membersKey, onlineMembersKey );

    // 5. Broadcast "Kitchen Closed" to all participants
    const io = req.app.get("io");
    io.to(roomId).emit("kitchen_closed", {
        message: "The Chef archived state to database and has closed the kitchen."
    });

    return res
        .status(200)
        .json(new ApiResponse(200, roomArchived, "Kitchen closed and participants state archived"));
});

const getRoomRecipe = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    if (room.isActive) {
        const isMember = await redisClient.sismember(`room:members:${roomId}`, req.user.username);
        if (!isMember) {
            throw new ApiError(404, "No recipe has been generated for this room yet");
        }
    } else {
        if (!room.participants.includes(req.user.username)) {
            throw new ApiError(403, "You were not part of this kitchen's history");
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, room, "Recipe retrieved successfully"));
});

const deleteRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    // 1. Find the room
    // 2. Authorization: Only the Admin can delete
    // 3. NUCLEAR OPTION: Remove everything from Redis
    // 4. Notify active users via Socket before deleting
    // 5. Delete from MongoDB

    const room = await Room.findOne({ roomId });
    if (!room) throw new ApiError(404, "Room not found");

    if (room.admin.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the Room Admin can delete this room");
    }

    const keys = [
        `pantry:${roomId}`,
        `room:members:${roomId}`,
        `room:online:${roomId}`
    ];
    await redisClient.del(keys);

    req.app.get("io").to(roomId).emit("room_deleted", {
        message: "The Admin has deleted this room. You are being redirected."
    });

    await Room.deleteOne({ _id: room._id });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Room deleted successfully"));
});

export { createRoom, 
    joinRoom, 
    addIngredient, 
    removeIngredient, 
    getPantryIngredients, 
    generateRecipe, 
    closeRoom,  
    getRoomRecipe, 
    deleteRoom,
}