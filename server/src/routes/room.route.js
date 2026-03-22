import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    addIngredient, 
    closeRoom, 
    createRoom, 
    deleteRoom, 
    getPantryIngredients, 
    getRoomHistory, 
    getRoomRecipe, 
    joinRoom, 
    removeIngredient 
} from "../controllers/room.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createRoomSchema, 
    ingredientSchema 
} from "../schemas/room.schema.js";
import { apiLimiter } from "../middlewares/rateLimiter.middleware.js";

const roomRouter = Router()

roomRouter.use(verifyJWT)

roomRouter.route("/create").post(validate(createRoomSchema), createRoom)
roomRouter.route("/:roomId/join").post(joinRoom)
roomRouter.route("/:roomId/add-ingredient").post(apiLimiter, validate(ingredientSchema), addIngredient)
roomRouter.route("/:roomId/remove-ingredient").delete(apiLimiter, validate(ingredientSchema), removeIngredient)
roomRouter.route("/:roomId/get-ingredients").get(getPantryIngredients)
roomRouter.route("/:roomId/close").post(closeRoom);
roomRouter.route("/gethistory").get(getRoomHistory);
roomRouter.route("/:roomId/roomstate").get(getRoomRecipe);
roomRouter.route("/:roomId").delete(deleteRoom);

export default roomRouter;