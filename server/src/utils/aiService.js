import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are a professional chef assistant for a collaborative pantry app.
When given a list of available ingredients, generate a complete practical recipe using
ONLY the listed ingredients — do not suggest or use any ingredients not in the list.

Always respond in this exact format:

Recipe Name: [name of dish]

Ingredients:
- [ingredient with quantity]
- [ingredient with quantity]

Instructions:
1. [step]
2. [step]
3. [step]

Keep the tone friendly and collaborative.`;

const generateRecipeFromIngredients = async (ingredients) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_PROMPT,
        });

        const prompt = `Generate a recipe using only these ingredients: ${ingredients.join(", ")}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("AI Generation Error:", error);
        return "Sorry, the chef is having trouble thinking of a recipe right now!";
    }
};

export { generateRecipeFromIngredients}