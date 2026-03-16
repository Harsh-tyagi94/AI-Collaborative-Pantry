import mongoose, { Schema } from "mongoose";

const memberSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomName: {
        type: String,
        trim: true,
        default: "Our Shared Kitchen",
    },
    generatedRecipe: {
        type: String,
        default: ""
    },
    finalIngredients: {
      type: [String],
      default: [],
    },
    members: {
        type: [memberSchema],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema)

export { Room}