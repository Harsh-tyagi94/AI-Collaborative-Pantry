import { GoogleGenerativeAI } from "@google/generative-ai";

const generateRecipeFromIngredients = async (ingredients) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `I have these ingredients: ${ingredients.join(", ")}. 
        Please provide a professional recipe including a Title, Prep Time, and step-by-step Instructions. 
        Keep the tone friendly, collaborative and give recipe according to only listed ingredients.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI Generation Error:", error);
        return "Sorry, the chef is having trouble thinking of a recipe right now!";
    }
};

export { generateRecipeFromIngredients}