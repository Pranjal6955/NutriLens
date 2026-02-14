const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cloudinary = require('cloudinary').v2;
const Meal = require('../models/Meal');
const logger = require('../utils/logger');
const APIKeyManager = require('../utils/apiKeyManager');

// Initialize API Key Manager
const apiKeyManager = new APIKeyManager();

// Configure Cloudinary
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} catch (error) {
  logger.error('Cloudinary configuration failed:', error);
  throw error;
}

// Configure Multer
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max file size
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    const fileExtension = file.originalname.toLowerCase().split('.').pop();

    if (
      !allowedMimeTypes.includes(file.mimetype) ||
      !allowedExtensions.includes(`.${fileExtension}`)
    ) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  },
});

// Analyze Route
router.post('/analyze', upload.single('image'), async (req, res) => {
  const requestId = Date.now().toString();

  try {
    logger.info(`Analysis request started: ${requestId}`);

    if (!req.file) {
      logger.warn(`No image uploaded: ${requestId}`);
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Get valid API key with rotation and rate limiting
    const apiKey = await apiKeyManager.getValidKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const mimeType = req.file.mimetype;
    const imageBuffer = req.file.buffer;
    const imageBase64 = imageBuffer.toString('base64');

    // Upload to Cloudinary
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'nutrilens' },
          (error, result) => {
            if (error) {
              logger.error(`Cloudinary upload failed: ${requestId}`, error);
              reject(error);
            } else if (result) {
              logger.info(`Cloudinary upload success: ${requestId}`);
              resolve(result.secure_url);
            } else {
              const uploadError = new Error('Upload failed');
              logger.error(
                `Cloudinary upload failed: ${requestId}`,
                uploadError
              );
              reject(uploadError);
            }
          }
        );
        stream.end(imageBuffer);
      });
    };

    const quantity = req.body.quantity || 'Not specified';

    // Please Don't change the this part
    const prompt = `Analyze this food image thoroughly. Identify the food item(s).
    
    User Context/Quantity provided: "${quantity}".
    If the user provided a quantity, USE IT as the ground truth for your nutritional calculations.

    Estimate the quantity (e.g., number of pieces, number of bowls) if not provided, and provide a complete and DETAILED nutritional breakdown.

    Return ONLY valid JSON in the following format (all numeric values MUST be numbers, not strings):
    {
      "foodName": "...",
        "servingSize": "...",
      "isHealthy": true/false,
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
       }
    Notes:
    - All gram values should be in grams (g)
    - Vitamins and minerals in milligrams (mg) or appropriate units (mcg for certain vitamins if standard, but preferably normalize to mg or specify unit if implicit constraints allow - however schema implies Number so stick to standard numerical values, e.g. mg for Sodium/Potassium/Calcium/Iron/Magnesium/Zinc. Vitamin A/D/B12/C usually mg or mcg. Provide best estimate in standard units.)
    - Percentages should be whole numbers (0-100)
    - healthScore should be 0-100
    - Be accurate with portion size estimation based on the User Context provided.
    - Provide NON-ZERO estimates for micronutrients if reasonable trace amounts exist. Do not just zero them out unless completely absent.`;

    const part = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };

    const [imageUrl, result] = await Promise.all([
      uploadToCloudinary(),
      model.generateContent([prompt, part]),
    ]);

    const response = await result.response;
    let text = response.text();

    // Clean up JSON string
    text = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let analysisData;
    try {
      analysisData = JSON.parse(text);
      logger.info(`AI analysis successful: ${requestId}`);
    } catch (e) {
      logger.error(`JSON parsing failed: ${requestId}`, e);
      throw new Error('Failed to parse AI response');
    }

    // Portion estimation heuristics
    const estimatePortion = (providedQuantity, servingSizeText, imageBytes) => {
      // Defaults
      const categories = {
        small: { multiplier: 0.8, grams: 150, confidence: 0.6 },
        medium: { multiplier: 1.0, grams: 250, confidence: 0.7 },
        large: { multiplier: 1.3, grams: 400, confidence: 0.6 },
      };

      // If user provided quantity, try to parse grams or category
      if (providedQuantity) {
        const q = providedQuantity.toString().toLowerCase();
        const gramsMatch = q.match(/(\d+)\s?g/);
        if (gramsMatch) {
          const grams = parseInt(gramsMatch[1], 10);
          // Map grams to nearest category
          if (grams < 180)
            return {
              category: 'small',
              grams,
              multiplier: grams / 250,
              confidence: 0.9,
            };
          if (grams < 320)
            return {
              category: 'medium',
              grams,
              multiplier: grams / 250,
              confidence: 0.9,
            };
          return {
            category: 'large',
            grams,
            multiplier: grams / 250,
            confidence: 0.9,
          };
        }
        if (q.includes('small'))
          return { ...categories.small, category: 'small' };
        if (q.includes('medium'))
          return { ...categories.medium, category: 'medium' };
        if (q.includes('large'))
          return { ...categories.large, category: 'large' };
      }

      // Try parsing servingSizeText from AI response
      if (servingSizeText && typeof servingSizeText === 'string') {
        const s = servingSizeText.toLowerCase();
        const gramsMatch = s.match(/(\d+)\s?g/);
        if (gramsMatch) {
          const grams = parseInt(gramsMatch[1], 10);
          if (grams < 180)
            return {
              category: 'small',
              grams,
              multiplier: grams / 250,
              confidence: 0.8,
            };
          if (grams < 320)
            return {
              category: 'medium',
              grams,
              multiplier: grams / 250,
              confidence: 0.85,
            };
          return {
            category: 'large',
            grams,
            multiplier: grams / 250,
            confidence: 0.8,
          };
        }
        if (s.includes('small'))
          return { ...categories.small, category: 'small' };
        if (s.includes('medium'))
          return { ...categories.medium, category: 'medium' };
        if (s.includes('large'))
          return { ...categories.large, category: 'large' };
      }

      // Fallback: use image byte size heuristic
      const bytes = imageBytes || 0;
      // thresholds chosen conservatively
      if (bytes > 200000)
        return { ...categories.large, category: 'large', confidence: 0.45 };
      if (bytes > 90000)
        return { ...categories.medium, category: 'medium', confidence: 0.5 };
      return { ...categories.small, category: 'small', confidence: 0.45 };
    };

    // Preserve original nutrition values then scale based on estimate
    const providedQuantity = req.body.quantity;
    const portion = estimatePortion(
      providedQuantity,
      analysisData.servingSize,
      imageBuffer.length
    );

    // Save original nutrition snapshot
    const originalCalories =
      typeof analysisData.calories === 'number' ? analysisData.calories : 0;
    const originalMacros = {
      protein: analysisData.macronutrients?.protein ?? 0,
      carbs: analysisData.macronutrients?.carbs ?? 0,
      fat: analysisData.macronutrients?.fat ?? 0,
      fiber: analysisData.macronutrients?.fiber ?? 0,
      sugar: analysisData.macronutrients?.sugar ?? 0,
    };

    // Compute adjusted values by multiplier
    const multiplier = portion.multiplier || 1;
    const adjustedCalories =
      Math.round(originalCalories * multiplier * 10) / 10;
    const adjustedMacros = {
      protein: Math.round(originalMacros.protein * multiplier * 10) / 10,
      carbs: Math.round(originalMacros.carbs * multiplier * 10) / 10,
      fat: Math.round(originalMacros.fat * multiplier * 10) / 10,
      fiber: Math.round(originalMacros.fiber * multiplier * 10) / 10,
      sugar: Math.round(originalMacros.sugar * multiplier * 10) / 10,
    };

    // Merge adjusted values back into analysisData so UI shows scaled numbers
    analysisData.originalNutrition = {
      calories: originalCalories,
      macronutrients: originalMacros,
    };
    analysisData.portionEstimate = portion;

    analysisData.calories = adjustedCalories;
    if (!analysisData.macronutrients) analysisData.macronutrients = {};
    analysisData.macronutrients.protein = adjustedMacros.protein;
    analysisData.macronutrients.carbs = adjustedMacros.carbs;
    analysisData.macronutrients.fat = adjustedMacros.fat;
    analysisData.macronutrients.fiber = adjustedMacros.fiber;
    analysisData.macronutrients.sugar = adjustedMacros.sugar;

    // Save to Database
    const newMeal = new Meal({
      imagePath: imageUrl,
      ...analysisData,
    });

    await newMeal.save();
    logger.info(`Meal saved to database: ${requestId}`);

    res.json({
      message: 'Analysis successful',
      data: newMeal,
    });
  } catch (error) {
    if (error.message === 'All API keys have exceeded rate limits') {
      logger.error(`API rate limit exceeded: ${requestId}`, error);
      return res.status(429).json({
        error: 'Service temporarily unavailable. Please try again later.',
        requestId,
      });
    }

    logger.error(`Analysis failed: ${requestId}`, error);
    res.status(500).json({
      error: 'Analysis failed',
      requestId,
    });
  }
});

// API Usage Stats Route
router.get('/api-stats', (req, res) => {
  try {
    const stats = apiKeyManager.getUsageStats();
    res.json({
      message: 'API usage statistics',
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get API stats:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Persist user-adjusted portion for a saved meal
router.patch('/history/:id/portion', async (req, res) => {
  const requestId = Date.now().toString();
  try {
    const { id } = req.params;
    const { portion } = req.body;

    if (!portion || typeof portion !== 'object') {
      return res.status(400).json({ error: 'Invalid portion payload' });
    }

    const meal = await Meal.findById(id);
    if (!meal) return res.status(404).json({ error: 'Meal not found' });

    // Determine original nutrition snapshot
    const original =
      meal.originalNutrition && meal.originalNutrition.calories
        ? meal.originalNutrition
        : {
          calories: meal.calories || 0,
          macronutrients: {
            protein: meal.macronutrients?.protein ?? meal.protein ?? 0,
            carbs: meal.macronutrients?.carbs ?? meal.carbs ?? 0,
            fat: meal.macronutrients?.fat ?? meal.fat ?? 0,
            fiber: meal.macronutrients?.fiber ?? 0,
            sugar: meal.macronutrients?.sugar ?? 0,
          },
        };

    // Compute multiplier
    let newMultiplier = 1;
    if (
      typeof portion.multiplier === 'number' &&
      isFinite(portion.multiplier) &&
      portion.multiplier > 0
    ) {
      newMultiplier = portion.multiplier;
    } else if (
      typeof portion.grams === 'number' &&
      isFinite(portion.grams) &&
      portion.grams > 0
    ) {
      const baseGrams = meal.portionEstimate?.grams || 250; // default medium
      newMultiplier = portion.grams / baseGrams;
    }

    // Apply multiplier
    const adjustedCalories =
      Math.round(original.calories * newMultiplier * 10) / 10;
    const adjustedMacros = {
      protein:
        Math.round(
          (original.macronutrients?.protein ?? 0) * newMultiplier * 10
        ) / 10,
      carbs:
        Math.round((original.macronutrients?.carbs ?? 0) * newMultiplier * 10) /
        10,
      fat:
        Math.round((original.macronutrients?.fat ?? 0) * newMultiplier * 10) /
        10,
      fiber:
        Math.round((original.macronutrients?.fiber ?? 0) * newMultiplier * 10) /
        10,
      sugar:
        Math.round((original.macronutrients?.sugar ?? 0) * newMultiplier * 10) /
        10,
    };

    // Update meal
    meal.portionEstimate = {
      category: portion.category || meal.portionEstimate?.category,
      grams: portion.grams || meal.portionEstimate?.grams,
      multiplier: newMultiplier,
      confidence: portion.confidence || meal.portionEstimate?.confidence || 0.5,
    };

    meal.calories = adjustedCalories;
    meal.macronutrients = meal.macronutrients || {};
    meal.macronutrients.protein = adjustedMacros.protein;
    meal.macronutrients.carbs = adjustedMacros.carbs;
    meal.macronutrients.fat = adjustedMacros.fat;
    meal.macronutrients.fiber = adjustedMacros.fiber;
    meal.macronutrients.sugar = adjustedMacros.sugar;

    // Ensure originalNutrition preserved
    if (!meal.originalNutrition || !meal.originalNutrition.calories) {
      meal.originalNutrition = original;
    }

    await meal.save();
    logger.info(`Portion updated for meal ${id}: ${requestId}`);

    res.json({ message: 'Portion updated', data: meal });
  } catch (error) {
    logger.error(`Failed to update portion: ${requestId}`, error);
    res.status(500).json({ error: 'Failed to update portion' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const { limit, skip, search, healthy } = req.query;
    const parsedLimit = Math.min(parseInt(limit, 10) || 20, 50);
    const parsedSkip = Math.max(parseInt(skip, 10) || 0, 0);

    logger.info(`History request: limit=${parsedLimit}, skip=${parsedSkip}`);

    // Build query with indexes
    let query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (healthy !== undefined) {
      query.isHealthy = healthy === 'true';
    }

    const meals = await Meal.find(query)
      .sort({ createdAt: -1 })
      .skip(parsedSkip)
      .limit(parsedLimit)
      .lean(); // Use lean() for better performance

    const total = await Meal.countDocuments(query);

    res.json({
      data: meals,
      pagination: { total, limit: parsedLimit, skip: parsedSkip },
    });
  } catch (error) {
    logger.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.delete('/history', async (req, res) => {
  try {
    const result = await Meal.deleteMany({});
    logger.info(`History cleared: ${result.deletedCount} records deleted`);
    res.json({ message: 'History cleared' });
  } catch (error) {
    logger.error('History clear error:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

module.exports = router;
