import { redisClient } from "../db/index.js";
import { Recipe } from "../models/recipe.model.js";
import { Room } from "../models/room.model.js";
import { generateRecipeFromIngredients } from "../utils/aiService.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateRecipe = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findOne({ roomId });
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (room.admin.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "Only the Room Admin (Chef) can generate the recipe",
    );
  }

  const pantryKey = `room:${roomId}:pantry`;
  const ingredients = await redisClient.smembers(pantryKey);

  if (ingredients.length === 0) {
    throw new ApiError(
      400,
      "The pantry is empty! Add ingredients before cooking.",
    );
  }

  const recipe = await generateRecipeFromIngredients(ingredients);

  req.app.get("io").to(roomId).emit("recipe_generated", {
    recipe,
    ingredients,
    generatedBy: req.user.username,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { recipe, ingredients },
        "Recipe generated successfully",
      ),
    );
});

const saveRecipe = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { recipe, ingredients } = req.body;

  const room = await Room.findOne({ roomId });
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (room.admin.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "Only the Room Admin (Chef) can generate the recipe",
    );
  }

  if (!recipe || !ingredients) {
    throw new ApiError(400, "Invalid data");
  }

//   console.log(ingredients);

  const recipeDoc = await Recipe.create({
    roomId,
    generatedBy: req.user._id,
    recipeText: recipe,
    ingredients,
  });

  req.app.get("io").to(roomId).emit("recipe_saved", {
    recipe,
    ingredients,
  });

  await Room.updateOne({ roomId }, { $push: { recipes: recipeDoc._id } });

  return res.status(201).json(new ApiResponse(201, recipeDoc, "Recipe saved"));
});

const deleteRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) throw new ApiError(404, "Recipe not found");

  await Room.updateOne(
    { roomId: recipe.roomId },
    { $pull: { recipes: recipe._id } },
  );

  await Recipe.findByIdAndDelete(recipeId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Deleted Recipe Successfully"));
});

const getSavedPages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 5);

  const room = await Room.findOne({ roomId });
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  const recipes = await Recipe.find({ roomId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

//   console.log(recipes);

  const total = await Recipe.countDocuments({ roomId });

  const hasMore = page * limit < total;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        recipes,
        page,
        hasMore,
      },
      "Saved recipes fetched successfully"
    )
  );
});

export { generateRecipe, saveRecipe, deleteRecipe, getSavedPages };
