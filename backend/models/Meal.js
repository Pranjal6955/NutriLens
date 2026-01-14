const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  imagePath: {
    type: String,
    required: true,
  },
  foodName: {
    type: String,
    required: false,
  },
  isHealthy: {
    type: Boolean,
    required: false,
  },
  analysis: {
    type: String, // Full text analysis
    required: false,
  },
  servingSize: {
    type: String,
    required: false,
  },
  macronutrients: {
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
  },
  micronutrients: {
    sodium: Number,
    cholesterol: Number,
    vitaminA: Number,
    vitaminC: Number,
    calcium: Number,
    iron: Number,
  },
  nutritionBreakdown: {
    proteinPercent: Number,
    carbsPercent: Number,
    fatPercent: Number,
  },
  healthMetrics: {
    healthScore: Number,
    benefits: [String],
    concerns: [String],
  },
  calories: {
    type: Number,
    required: false,
  },
  fat: Number, // Keep for backward compatibility if needed, or rely on macronutrients.fat
  protein: Number,
  carbs: Number,
  recommendation: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Meal', MealSchema);
