import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteRecipe, generateRecipe, getSavedPages, saveRecipe } from "../controllers/recipe.controller.js";
import { Recipe } from "../models/recipe.model.js";

const recipeRouter = Router()

recipeRouter.use(verifyJWT)

recipeRouter.route('/').get((req, res) => {
    res.send('recipe route is working')
})

recipeRouter.route('/:roomId/generate').post(generateRecipe)
recipeRouter.route('/:roomId/save').post(saveRecipe)
recipeRouter.route('/:recipeId').delete(deleteRecipe)
recipeRouter.route('/:roomId/saved').get(getSavedPages)


export default recipeRouter;