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
  calories: {
    type: Number, // numeric value in kcal
    required: false,
  },
  fat: {
    type: Number, // numeric value in grams
    required: false,
  },
  protein: {
    type: Number, // numeric value in grams
    required: false,
  },
  carbs: {
    type: Number, // numeric value in grams
    required: false,
  },
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
