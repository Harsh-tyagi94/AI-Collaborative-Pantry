import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/slices/authSlice"
import roomReducer from "../store/slices/roomSlice"
import ingredientReducer from "../store/slices/ingredientSlice"
import recipeReducer from "../store/slices/recipeSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        room: roomReducer,
        ingredient: ingredientReducer,
        recipe: recipeReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;