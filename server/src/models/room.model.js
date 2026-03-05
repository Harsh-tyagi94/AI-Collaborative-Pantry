import mongoose, { Schema } from "mongoose";

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
    finalIngredients: [String], 
    participants: {
        type: [String],
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