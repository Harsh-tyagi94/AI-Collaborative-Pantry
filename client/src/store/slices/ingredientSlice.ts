import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Ingredient {
  ingredient: string;
  addedBy: string;
}

interface IngredientState {
  items: Ingredient[];
}

const initialState: IngredientState = {
  items: [],
};

const ingredientSlice = createSlice({
  name: "ingredeints",
  initialState,
  reducers: {
    setIngredients(state, action: PayloadAction<Ingredient[]>) {
      state.items = action.payload;
    },

    addIngredient(state, action: PayloadAction<Ingredient>) {
      const exists = state.items.find(
        (item) => item.ingredient === action.payload.ingredient,
      );

      if (!exists) {
        state.items.push(action.payload);
      }
    },

    removeIngredient(state, action: PayloadAction<Ingredient>) {
      state.items = state.items.filter(
        (item) => item.ingredient !== action.payload.ingredient
      );
    },

    clearIngredients(state) {
        state.items = []
    },
  },
});

export const { setIngredients, addIngredient, removeIngredient, clearIngredients } = ingredientSlice.actions

export default ingredientSlice.reducer
