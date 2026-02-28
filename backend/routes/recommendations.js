const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Meal = require('../models/Meal');
const logger = require('../utils/logger');
const APIKeyManager = require('../utils/apiKeyManager');
const { recommendationPrompt } = require('../utils/prompts');

const apiKeyManager = new APIKeyManager();

const DAILY_TARGETS = {
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 65,
};

router.get('/recommendations', async (req, res) => {
    const requestId = Date.now().toString();

    try {
        logger.info(`Recommendation request started: ${requestId}`);

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const todaysMeals = await Meal.find({
            createdAt: { $gte: startOfDay },
        }).lean();

        const dailyTotals = todaysMeals.reduce(
            (acc, meal) => {
                acc.calories += meal.calories || 0;
                acc.protein += meal.macronutrients?.protein || 0;
                acc.carbs += meal.macronutrients?.carbs || 0;
                acc.fat += meal.macronutrients?.fat || 0;
                return acc;
            },
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        const remaining = {
            calories: Math.max(0, DAILY_TARGETS.calories - dailyTotals.calories),
            protein: Math.max(0, DAILY_TARGETS.protein - dailyTotals.protein),
            carbs: Math.max(0, DAILY_TARGETS.carbs - dailyTotals.carbs),
            fat: Math.max(0, DAILY_TARGETS.fat - dailyTotals.fat),
        };

        const recentFoods = todaysMeals
            .map(meal => meal.foodName)
            .filter(Boolean);

        const prompt = recommendationPrompt(
            remaining.calories,
            remaining.protein,
            remaining.carbs,
            remaining.fat,
            recentFoods
        );

        const apiKey = await apiKeyManager.getValidKey();
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const result = await model.generateContent([prompt]);
        const response = await result.response;
        let text = response.text();

        text = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        let recipes;
        try {
            recipes = JSON.parse(text);
            logger.info(`Recommendations generated successfully: ${requestId}`);
        } catch (parseError) {
            logger.error(`Failed to parse recommendation response: ${requestId}`, parseError);
            return res.status(500).json({
                error: 'Failed to parse AI recommendations',
                requestId,
            });
        }

        if (!Array.isArray(recipes)) {
            recipes = [recipes];
        }

        res.json({
            recipes,
            dailyTotals,
            remaining,
            mealsLogged: todaysMeals.length,
        });
    } catch (error) {
        if (error.message === 'All API keys have exceeded rate limits') {
            logger.error(`API rate limit exceeded: ${requestId}`, error);
            return res.status(429).json({
                error: 'Service temporarily unavailable. Please try again later.',
                requestId,
            });
        }

        logger.error(`Recommendation generation failed: ${requestId}`, error);
        res.status(500).json({
            error: 'Failed to generate recommendations',
            requestId,
        });
    }
});

module.exports = router;
