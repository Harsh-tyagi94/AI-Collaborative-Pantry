import z from "zod";

export const IngredientInputSchema = z.object({
  ingredient: z
    .string()
    .min(2, "Ingredient must be at least 2 characters")
    .max(30, "Ingredient too long")
    .trim().toLowerCase(),
});

export type createIngredientInput = z.infer<typeof IngredientInputSchema>;