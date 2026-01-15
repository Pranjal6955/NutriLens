const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cloudinary = require('cloudinary').v2;
const Meal = require('../models/Meal');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer (Memory Storage)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max file size
    files: 1, // only one file expected for this route
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          'Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'
        )
      );
    }
    cb(null, true);
  },
});

// Initialize Gemini
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

// Analyze Route
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const mimeType = req.file.mimetype;
    const imageBuffer = req.file.buffer;
    const imageBase64 = imageBuffer.toString('base64');

    // Upload to Cloudinary
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'nutrilens' },
          (error, result) => {
            if (result) {
              resolve(result.secure_url);
            } else {
              reject(error);
            }
          }
        );
        stream.end(imageBuffer);
      });
    };

    const imageUrl = await uploadToCloudinary();

    const prompt = `Analyze this food image thoroughly. Identify the food item(s), estimate the quantity (e.g., number of pieces, number of bowls), and provide a complete nutritional breakdown.

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
        "iron": 0
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
    - Be accurate with portion size estimation (e.g., "2 slices", "1 bowl", "3 pieces")`;

    const part = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, part]);
    const response = await result.response;
    let text = response.text();

    console.log('Gemini Raw Response:', text);

    // Clean up JSON string if it contains markdown code blocks
    text = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let analysisData;
    try {
      analysisData = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      analysisData = {
        foodName: 'Unknown',
        isHealthy: false,
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

    res.json({
      message: 'Analysis successful',
      data: newMeal,
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const { limit, skip } = req.query;
    const parsedLimit = parseInt(limit, 10) || 20;
    const parsedSkip = parseInt(skip, 10) || 0;

    // Cap limit to prevent excessive data transfer
    const finalLimit = Math.min(parsedLimit, 100);

    const meals = await Meal.find()
      .sort({ createdAt: -1 })
      .skip(parsedSkip)
      .limit(finalLimit);

    const total = await Meal.countDocuments();

    res.json({
      data: meals,
      pagination: {
        total,
        limit: finalLimit,
        skip: parsedSkip,
      },
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.delete('/history', async (req, res) => {
  try {
    await Meal.deleteMany({});
    res.json({ message: 'History cleared' });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

module.exports = router;
