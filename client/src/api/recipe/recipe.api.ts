import api from "@/lib/axios";

export const getSavedRecipes = async (
  roomId: string,
  page: number = 1,
  limit: number = 5
) => {
  const response = await api.get(`/recipes/${roomId}/saved`, {
    params: { page, limit },
  });

  return response.data;
};

export const generateRecipe = async (roomId: string) => {
  const response = await api.post(`/recipes/${roomId}/generate`);
  return response.data;
};

export const saveRecipe = async (
  roomId: string,
  recipe: string,
  ingredients: string[]
) => {
  const response = await api.post(`/recipes/${roomId}/save`, {
    recipe,
    ingredients,
  });
  return response.data;
};