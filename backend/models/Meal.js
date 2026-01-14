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
    type: String, // Approximate calories
    required: false,
  },
  fat: {
    type: String,
    required: false,
  },
  protein: {
    type: String,
    required: false,
  },
  carbs: {
    type: String,
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
