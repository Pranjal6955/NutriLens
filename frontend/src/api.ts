import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

export interface MealData {
  _id: string;
  foodName: string;
  servingSize?: string;
  portionEstimate?: {
    category?: string;
    grams?: number;
    multiplier?: number;
    confidence?: number;
  };
  originalNutrition?: {
    calories?: number;
    macronutrients?: {
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
      sugar?: number;
    };
  };
  isHealthy: boolean;
  calories: number;
  macronutrients: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  micronutrients: {
    sodium: number;
    cholesterol: number;
    vitaminA: number;
    vitaminC: number;
    calcium: number;
    iron: number;
    potassium?: number;
    magnesium?: number;
    zinc?: number;
    vitaminD?: number;
    vitaminB12?: number;
  };
  nutritionBreakdown: {
    proteinPercent: number;
    carbsPercent: number;
    fatPercent: number;
  };
  healthMetrics: {
    healthScore: number;
    benefits: string[];
    concerns: string[];
  };
  fat?: number;
  protein?: number;
  carbs?: number;
  analysis: string;
  recommendation: string;
  imagePath: string;
  createdAt: string;
}

export interface HistoryResponse {
  data: MealData[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
  };
}

export interface Recipe {
  title: string;
  prepTime: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  tags: string[];
}

import { compressImage } from './utils/imageOptimizer';

export const analyzeImage = async (file: File, quantity?: string): Promise<MealData> => {
  const compressedFile = await compressImage(file);
  const formData = new FormData();
  if (quantity) {
    formData.append('quantity', quantity);
  }
  formData.append('image', compressedFile);

  const response = await axios.post(`${API_URL}/analyze`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

export const getHistory = async (limit = 20, skip = 0): Promise<HistoryResponse> => {
  const response = await axios.get(`${API_URL}/history`, {
    params: { limit, skip },
  });
  return response.data;
};

export const clearHistory = async (): Promise<void> => {
  await axios.delete(`${API_URL}/history`);
};

export const savePortionAdjustment = async (
  mealId: string,
  portion: MealData['portionEstimate'],
) => {
  const response = await axios.patch(`${API_URL}/history/${mealId}/portion`, { portion });
  return response.data.data;
};

export const getImageUrl = (imagePath: string) => {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}/uploads/${imagePath}`;
};

export const sendChatMessage = async (
  message: string,
): Promise<{
  text: string;
  report?: {
    carbs: number;
    protein: number;
    fats: number;
  };
  healthTip?: string;
  info?: string;
}> => {
  const response = await axios.post(`${API_URL}/chat`, { message });
  return response.data;
};

export const getRecommendations = async (): Promise<Recipe[]> => {
  const response = await axios.get(`${API_URL}/recommendations`);
  return response.data.recipes;
};
