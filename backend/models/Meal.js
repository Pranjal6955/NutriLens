const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  imagePath: {
    type: String,
    required: [true, 'Image path is required'],
    trim: true,
    maxlength: [500, 'Image path too long']
  },
  foodName: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true,
    maxlength: [100, 'Food name too long'],
    minlength: [1, 'Food name cannot be empty']
  },
  isHealthy: {
    type: Boolean,
    default: false
  },
  analysis: {
    type: String,
    maxlength: [1000, 'Analysis too long'],
    trim: true
  },
  servingSize: {
    type: String,
    maxlength: [50, 'Serving size too long'],
    trim: true
  },
  macronutrients: {
    protein: { type: Number, min: 0, max: 1000, default: 0 },
    carbs: { type: Number, min: 0, max: 1000, default: 0 },
    fat: { type: Number, min: 0, max: 1000, default: 0 },
    fiber: { type: Number, min: 0, max: 100, default: 0 },
    sugar: { type: Number, min: 0, max: 500, default: 0 }
  },
  micronutrients: {
    sodium: { type: Number, min: 0, max: 10000, default: 0 },
    cholesterol: { type: Number, min: 0, max: 1000, default: 0 },
    vitaminA: { type: Number, min: 0, max: 1000, default: 0 },
    vitaminC: { type: Number, min: 0, max: 1000, default: 0 },
    calcium: { type: Number, min: 0, max: 2000, default: 0 },
    iron: { type: Number, min: 0, max: 100, default: 0 },
    potassium: { type: Number, min: 0, max: 5000, default: 0 },
    magnesium: { type: Number, min: 0, max: 1000, default: 0 },
    zinc: { type: Number, min: 0, max: 100, default: 0 },
    vitaminD: { type: Number, min: 0, max: 100, default: 0 },
    vitaminB12: { type: Number, min: 0, max: 100, default: 0 }
  },
  nutritionBreakdown: {
    proteinPercent: { type: Number, min: 0, max: 100, default: 0 },
    carbsPercent: { type: Number, min: 0, max: 100, default: 0 },
    fatPercent: { type: Number, min: 0, max: 100, default: 0 }
  },
  healthMetrics: {
    healthScore: { type: Number, min: 0, max: 100, default: 0 },
    benefits: [{ type: String, maxlength: 200 }],
    concerns: [{ type: String, maxlength: 200 }]
  },
  calories: {
    type: Number,
    required: [true, 'Calories are required'],
    min: [0, 'Calories cannot be negative'],
    max: [5000, 'Calories too high']
  },
  recommendation: {
    type: String,
    maxlength: [500, 'Recommendation too long'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for performance
MealSchema.index({ createdAt: -1 });
MealSchema.index({ foodName: 'text', analysis: 'text' });
MealSchema.index({ isHealthy: 1, createdAt: -1 });

module.exports = mongoose.model('Meal', MealSchema);
