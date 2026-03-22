import mongoose, { Schema } from "mongoose";

const recipeSchema = new Schema(
  {
    roomId: {
      type: String,
      required: true,
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ingredients: {
      type: [String],
      required: true,
    },
    recipeText: {
      type: String,
      required: true,
    },
    isSaved: {
      type: Boolean,
      default: true, // for save / dislike logic
    },
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

export { Recipe };