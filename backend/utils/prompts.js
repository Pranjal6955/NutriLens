const chatPrompt = message => `You are NutriBot, a helpful nutrition assistant.
User Message: "${message}"

Respond in valid JSON format ONLY:
{
  "text": "Your helpful response text here...",
  "report": {
     "carbs": 0,
     "protein": 0,
     "fats": 0
  },
  "healthTip": "Optional: A short, actionable health tip if relevant (e.g. 'Drink water before meals').",
  "info": "Optional: Fun fact or verified nutritional fact if relevant."
}

Rules:
- If user describes food (e.g. "I ate pizza"), provide "report".
- If user asks for advice/tips, provide "healthTip".
- Keep "text" concise.
- Don't force a report if not applicable.
`;

const analysisPrompt =
  quantity => `Analyze this food image thoroughly. Identify the food item(s).
    
User Context/Quantity provided: "${quantity}".
If the user provided a quantity, USE IT as the ground truth for your nutritional calculations.

Estimate the quantity (e.g., number of pieces, number of bowls) if not provided, and provide a complete and DETAILED nutritional breakdown.

Return ONLY valid JSON in the following format (all numeric values MUST be numbers, not strings):
{
  "foodName": "...",
    "servingSize": "...",
  "isHealthy": true,
  "calories": 0,
  "macronutrients": {
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "fiber": 0,
    "sugar": 0
  },
  "micronutrients": {
    "sodium": 0,
    "cholesterol": 0,
    "vitaminA": 0,
    "vitaminC": 0,
    "calcium": 0,
    "iron": 0,
    "potassium": 0,
    "magnesium": 0,
    "zinc": 0,
    "vitaminD": 0,
    "vitaminB12": 0
  },
  "nutritionBreakdown": {
    "proteinPercent": 0,
    "carbsPercent": 0,
    "fatPercent": 0
  },
  "healthMetrics": {
    "healthScore": 0,
    "benefits": ["...", "..."],
    "concerns": ["...", "..."]
  },
  "analysis": "Detailed analysis of the food's nutritional value, preparation method, and health implications (2-3 sentences)",
  "recommendation": "What to eat next to balance this meal nutritionally (be specific with food suggestions)"
}
Notes:
- All gram values should be in grams (g)
- Vitamins and minerals in milligrams (mg) or appropriate units
- Percentages should be whole numbers (0-100)
- healthScore should be 0-100
- Be accurate with portion size estimation based on the User Context provided.
- Provide NON-ZERO estimates for micronutrients if reasonable trace amounts exist. Do not just zero them out unless completely absent.`;

const recommendationPrompt = (remainingCalories, remainingProtein, remainingCarbs, remainingFat, recentFoods) => {
  const foodContext = recentFoods && recentFoods.length > 0
    ? `The user has recently eaten: ${recentFoods.join(', ')}. Suggest different foods to add variety.`
    : 'The user has not logged any meals today yet. Suggest balanced meals for the day.';

  return `You are a professional nutritionist AI. ${foodContext}

The user's remaining daily nutritional targets are:
- Calories: ${remainingCalories} kcal
- Protein: ${remainingProtein} g
- Carbs: ${remainingCarbs} g
- Fat: ${remainingFat} g

Suggest exactly 3 healthy, practical recipes that collectively help the user meet their remaining nutritional goals. Each recipe should be simple to prepare at home.

Return ONLY valid JSON as an array of exactly 3 objects in the following format (all numeric values MUST be numbers, not strings):
[
  {
    "title": "Recipe Name",
    "prepTime": "15 mins",
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity"],
    "instructions": ["Step 1 description", "Step 2 description"],
    "tags": ["high-protein", "low-carb"]
  }
]

Rules:
- Each recipe should target roughly one-third of the remaining daily macros.
- Tags should be relevant descriptors like "high-protein", "low-carb", "low-fat", "quick", "vegan", "gluten-free", etc.
- Keep instructions concise but actionable (3-6 steps per recipe).
- Include 4-8 ingredients per recipe with specific quantities.
- Prep time should be realistic.
- All calorie values in kcal, macros in grams.`;
};

module.exports = {
  chatPrompt,
  analysisPrompt,
  recommendationPrompt,
};
