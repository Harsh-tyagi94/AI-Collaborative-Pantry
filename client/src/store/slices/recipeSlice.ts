import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface RecipeItem {
  recipe: string;
  ingredients: string[];
  createdAt: string;
}

interface RecipeState {
  currentRecipe: string | null;
  ingredient: string[];
  isSaved: boolean;
  savedRecipes: RecipeItem[];
  page: number;
  hasMore: boolean;
}

const initialState: RecipeState = {
  currentRecipe: null,
  ingredient: [],
  isSaved: false,
  savedRecipes: [],
  page: 1,
  hasMore: true,
};

const recipeSlice = createSlice({
  name: "recipe",
  initialState,
  reducers: {
    setRecipe(state, action: PayloadAction<{ recipe: string; ingredient: string[] }>) {
      state.currentRecipe = action.payload.recipe;
      state.ingredient = action.payload.ingredient;
      state.isSaved = false;
    },

    addSavedRecipe: (state, action) => {
      if (!Array.isArray(state.savedRecipes)) {
        state.savedRecipes = [];
      }

      state.savedRecipes.unshift(action.payload);
      state.isSaved = true;
    },

    setSavedRecipes: (state, action) => {
      state.savedRecipes = Array.isArray(action.payload) ? action.payload : [];
    },

    setSaved: (state) => {
      state.isSaved = true;
    },

    appendSavedRecipes: (state, action) => {
      state.savedRecipes.push(...action.payload);
      state.page += 1;

      if (action.payload.length === 0) {
        state.hasMore = false;
      }
    },

    clearRecipe(state) {
      state.currentRecipe = null;
      state.ingredient = []
      state.isSaved = false;
    },
  },
});

export const {
  setRecipe,
  addSavedRecipe,
  setSavedRecipes,
  setSaved,
  appendSavedRecipes,
  clearRecipe,
} = recipeSlice.actions;
export default recipeSlice.reducer;
