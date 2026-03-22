import { redisClient } from "../db/index.js";
import { Room } from "../models/room.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { nanoid } from "nanoid";

const createRoom = asyncHandler(async (req, res) => {
  // 1. Validation (Optional room name, but admin is mandatory)
  // 2. Generate a unique 10-character Room ID
  // 3. Create the room entry in MongoDB
  // Auto-join the admin as the first member in redis database

  const { roomName } = await req.body;

  if (!req.user?._id) {
    throw new ApiError(401, "You must be logged in to create a room");
  }

  const roomId = nanoid(10);

  const room = await Room.create({
    roomId: roomId,
    roomName: roomName || `${req.user.username}'s Kitchen`,
    admin: req.user._id,
  });

  if (!room) {
    throw new ApiError(500, "Something went wrong while creating the room");
  }

  const membersKey = `room:${room.roomId}:online`;
  await redisClient.sadd(membersKey, req.user.username);
  await redisClient.expire(membersKey, 86400);

  return res
    .status(201)
    .json(new ApiResponse(201, room, "Room created successfully"));
});

const joinRoom = asyncHandler(async (req, res) => {
  // 1. Check MongoDB to see if the room exists
  // 2. Authorization Check: Is user already a member?
  // 3. Redis Bookkeeping: Add user to the "Active members" Set
  // We use a Redis SET because it automatically handles unique values.

  const { roomId } = req.params;
  const room = await Room.findOne({ roomId });
  // console.log(room)
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (!room.isActive) {
    throw new ApiError(400, "This room has been closed");
  }
  const isMember = room.members.some(
    (member) => member.username === req.user.username,
  );

  if (!isMember) {
    room.members.push({
      userId: req.user._id,
      username: req.user.username,
    });

    await room.save();
  }

  const members = room.members.map((m) => m.username);

  return res.status(200).json(
    new ApiResponse(200, {
      room,
      members,
      message: "Successfully joined the kitchen",
    }),
  );
});

const addIngredient = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { ingredient } = await req.body;

  const membersKey = `room:${roomId}:online`;
  const isMember = await redisClient.sismember(membersKey, req.user.username);

  // console.log(isMember);

  if (!isMember) {
    throw new ApiError(
      403,
      "You must join this room before adding ingredients",
    );
  }

  if (!ingredient || ingredient.trim() === "") {
    throw new ApiError(400, "Ingredient name is required");
  }

  const pantryKey = `room:${roomId}:pantry`;
  const normalizedIngredient = ingredient.toLowerCase().trim();

  // console.log(normalizedIngredient);

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
    addedBy: req.user.username,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { ingredient: normalizedIngredient },
        "Ingredient added to pantry",
      ),
    );
});

const removeIngredient = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { ingredient } = await req.body;

  if (!ingredient) {
    throw new ApiError(400, "Ingredient name is required for removal");
  }

  const membersKey = `room:${roomId}:online`;
  const isMember = await redisClient.sismember(membersKey, req.user.username);

  if (!isMember) {
    throw new ApiError(403, "You do not have permission to edit this pantry");
  }

  const pantryKey = `room:${roomId}:pantry`;
  const normalizedIngredient = ingredient.toLowerCase().trim();

  await redisClient.srem(pantryKey, normalizedIngredient);

  const io = req.app.get("io");
  io.to(roomId).emit("ingredient_removed", {
    ingredient: normalizedIngredient,
    removedBy: req.user.username,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { ingredient: normalizedIngredient },
        "Ingredient removed from pantry",
      ),
    );
});

const getPantryIngredients = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  // 1. Verify the room exists in MongoDB
  // 2. Authorization Check
  // 3. Fetch all ingredients from Redis using smembers command
  // 4. Return the list (it will be of type array)
  const room = await Room.findOne({ roomId });
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  const membersKey = `room:${roomId}:online`;
  const isMember = await redisClient.sismember(membersKey, req.user.username);

  if (!isMember) {
    throw new ApiError(
      403,
      "Access denied. You are not a participant of this room",
    );
  }

  const pantryKey = `room:${roomId}:pantry`;
  const ingredients = await redisClient.smembers(pantryKey);

  const formattedIngredients = ingredients.map((item) => ({
    ingredient: item,
    addedBy: "someone", // placeholder (until you upgrade Redis)
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ingredients: formattedIngredients,
        count: formattedIngredients.length,
      },
      "Pantry fetched successfully",
    ),
  );
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
  const pantryKey = `room:${roomId}:pantry`;
  const membersKey = `room:${roomId}:online`;
  const allSessionMembers = await redisClient.smembers(membersKey);

  // Archive participants to MongoDB
  const roomArchived = await Room.findOneAndUpdate(
    { roomId },
    {
      members: allSessionMembers,
      isActive: false,
    },
    { new: true },
  );

  // 4. REDIS CLEANUP (Memory Management)
  await redisClient.del(pantryKey, membersKey);

  // 5. Broadcast "Kitchen Closed" to all participants
  const io = req.app.get("io");
  io.to(roomId).emit("kitchen_closed", {
    message: "The Chef archived state to database and has closed the kitchen.",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        roomArchived,
        "Kitchen closed and members state archived",
      ),
    );
});

const getRoomHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // helper to format rooms
  const formatRooms = (rooms) =>
    rooms.map((room) => {
      const latestRecipe = room.recipes?.[0];

      return {
        roomId: room.roomId,
        roomName: room.roomName,
        createdAt: room.createdAt,
        isActive: room.isActive,

        // new fields
        latestRecipe: latestRecipe
          ? {
              recipeText: latestRecipe.recipeText,
              ingredients: latestRecipe.ingredients,
              createdAt: latestRecipe.createdAt,
            }
          : null,

        recipesCount: room.recipes?.length || 0,
      };
    });

  // Admin rooms
  const adminRoomsRaw = await Room.find({ admin: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "recipes",
      options: { sort: { createdAt: -1 }, limit: 1 }, // 🔥 only latest
      select: "recipeText ingredients createdAt",
    });

  // Member rooms
  const memberRoomsRaw = await Room.find({
    "members.userId": userId,
    admin: { $ne: userId },
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "recipes",
      options: { sort: { createdAt: -1 }, limit: 1 },
      select: "recipeText ingredients createdAt",
    });

  const adminRooms = formatRooms(adminRoomsRaw);
  const memberRooms = formatRooms(memberRoomsRaw);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        adminRooms,
        memberRooms,
      },
      "Room history fetched successfully",
    ),
  );
});

const getRoomRecipe = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        roomId: room.roomId,
        roomName: room.roomName,
        adminId: room.admin,
        isActive: room.isActive
      },
      "Recipe retrieved successfully",
    ),
  );
});

const deleteRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (room.admin.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "Only the room admin can delete this room"
    );
  }

  await Recipe.deleteMany({ roomId });
  await Room.deleteOne({ roomId });


  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Room and all associated recipes deleted successfully"
    )
  );
});

export {
  createRoom,
  joinRoom,
  addIngredient,
  removeIngredient,
  getPantryIngredients,
  closeRoom,
  getRoomHistory,
  getRoomRecipe,
  deleteRoom,
};
