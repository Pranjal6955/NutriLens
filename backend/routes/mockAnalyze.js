const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory store for dev/mock mode
const meals = [];

// Helper to create a fake analysis
const makeFakeAnalysis = (imageUrl, quantity) => {
  const id = uuidv4();
  const createdAt = new Date();
  const baseCalories = 250; // base
  const macronutrients = {
    protein: 12,
    carbs: 30,
    fat: 10,
    fiber: 3,
    sugar: 5,
  };
  const originalNutrition = { calories: baseCalories, macronutrients };
  const portionEstimate = {
    category: 'medium',
    grams: 250,
    multiplier: 1,
    confidence: 0.7,
  };

  return {
    _id: id,
    imagePath: imageUrl || '/uploads/mock.png',
    foodName: 'Mock Food',
    servingSize: quantity || '1 serving',
    isHealthy: true,
    calories: baseCalories,
    macronutrients,
    micronutrients: {
      sodium: 50,
      cholesterol: 10,
      vitaminA: 0.5,
      vitaminC: 2,
      calcium: 20,
      iron: 1,
      potassium: 150,
      magnesium: 10,
      zinc: 0.5,
      vitaminD: 0,
      vitaminB12: 0,
    },
    nutritionBreakdown: {
      proteinPercent: 20,
      carbsPercent: 60,
      fatPercent: 20,
    },
    healthMetrics: {
      healthScore: 70,
      benefits: ['Protein source'],
      concerns: [],
    },
    analysis: 'This is a mock analysis.',
    recommendation: 'Add vegetables for fiber.',
    createdAt,
    portionEstimate,
    originalNutrition,
  };
};

// POST /api/analyze - accept either multipart or JSON in dev
router.post(
  '/analyze',
  express.urlencoded({ extended: true }),
  express.json(),
  (req, res) => {
    const quantity = req.body.quantity || req.query.quantity || 'Not specified';
    const imagePath = '/uploads/mock.png';
    const analysis = makeFakeAnalysis(imagePath, quantity);
    meals.unshift(analysis);
    res.json({ message: 'Analysis successful (mock)', data: analysis });
  }
);

// GET /api/history
router.get('/history', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);
  const data = meals.slice(skip, skip + limit);
  res.json({ data, pagination: { total: meals.length, limit, skip } });
});

// DELETE /api/history
router.delete('/history', (req, res) => {
  meals.length = 0;
  res.json({ message: 'History cleared' });
});

// PATCH /api/history/:id/portion
router.patch('/history/:id/portion', express.json(), (req, res) => {
  const { id } = req.params;
  const { portion } = req.body;
  const idx = meals.findIndex(m => m._id === id);
  if (idx === -1) return res.status(404).json({ error: 'Meal not found' });

  const meal = meals[idx];
  const original = meal.originalNutrition || meal;
  let newMultiplier = 1;
  if (portion && typeof portion.multiplier === 'number')
    newMultiplier = portion.multiplier;
  else if (portion && typeof portion.grams === 'number')
    newMultiplier = portion.grams / (meal.portionEstimate?.grams || 250);

  meal.portionEstimate = {
    ...(meal.portionEstimate || {}),
    ...portion,
    multiplier: newMultiplier,
  };
  meal.calories = Math.round(original.calories * newMultiplier * 10) / 10;
  meal.macronutrients = meal.macronutrients || {};
  meal.macronutrients.protein =
    Math.round((original.macronutrients?.protein ?? 0) * newMultiplier * 10) /
    10;
  meal.macronutrients.carbs =
    Math.round((original.macronutrients?.carbs ?? 0) * newMultiplier * 10) / 10;
  meal.macronutrients.fat =
    Math.round((original.macronutrients?.fat ?? 0) * newMultiplier * 10) / 10;

  meals[idx] = meal;
  res.json({ message: 'Portion updated (mock)', data: meal });
});

module.exports = router;
