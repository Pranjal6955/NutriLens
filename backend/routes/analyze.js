const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const Meal = require('../models/Meal');

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Initialize Gemini
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Analyze Route
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const mimeType = req.file.mimetype;

    // Read image file
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');

    const prompt = `Analyze this food image. Identify the food. Determine if it is healthy. Estimate calories, fat, protein, carbs. Provide a short analysis and a recommendation on what to eat next.
    Return ONLY valid JSON in the following format:
    {
      "foodName": "...",
      "isHealthy": true/false,
      "calories": "...",
        "fat": "...",
      "protein": "...",
      "carbs": "...",
      "analysis": "...",
      "recommendation": "..."
    }`;

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
      imagePath: req.file.filename, // Store filename, access via /uploads/filename
      ...analysisData,
    });

    await newMeal.save();

    res.json({
      message: 'Analysis successful',
      data: newMeal,
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const meals = await Meal.find().sort({ createdAt: -1 });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
