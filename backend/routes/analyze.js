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
      analysisData = {
        foodName: 'Unknown',
        servingSize: 'Unknown',
        isHealthy: false,
        calories: 0,
        macronutrients: { protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
        micronutrients: {
          sodium: 0,
          cholesterol: 0,
          vitaminA: 0,
          vitaminC: 0,
          calcium: 0,
          iron: 0,
          potassium: 0,
          magnesium: 0,
          zinc: 0,
          vitaminD: 0,
          vitaminB12: 0,
        },
        nutritionBreakdown: {
          proteinPercent: 0,
          carbsPercent: 0,
          fatPercent: 0,
        },
        healthMetrics: { healthScore: 0, benefits: [], concerns: [] },
        analysis: 'Could not parse AI response.',
        recommendation: 'Try taking a clearer photo.',
      };
    }

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
