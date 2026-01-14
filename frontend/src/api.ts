import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface MealData {
  _id: string;
  foodName: string;
  isHealthy: boolean;
  calories: number;
  fat: number;
  protein: number;
  carbs: number;
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

export const analyzeImage = async (file: File): Promise<MealData> => {
  const formData = new FormData();
  formData.append('image', file);

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

export const getImageUrl = (imagePath: string) => {
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}/uploads/${imagePath}`;
};
