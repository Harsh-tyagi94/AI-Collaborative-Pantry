import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface RecipeItem {
  recipe: string;
  ingredients: string[];
  createdAt: string;
}

interface RecipeState {
  currentRecipe: string | null;
  isSaved: boolean;
  savedRecipes: RecipeItem[];
  page: number;
  hasMore: boolean;
}

const initialState: RecipeState = {
  currentRecipe: null,
  isSaved: false,
  savedRecipes: [],
  page: 1,
  hasMore: true,
};

const recipeSlice = createSlice({
  name: "recipe",
  initialState,
  reducers: {
    setRecipe(state, action: PayloadAction<string>) {
      state.currentRecipe = action.payload;
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
