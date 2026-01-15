import React from 'react';
import { Download } from 'lucide-react';
import type { MealData } from '../api';

interface ExportButtonProps {
  result: MealData;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ result }) => {
  const handleExport = () => {
    if (!result) return;
    const report = `
NutriLens Analysis Report
-------------------------
Date: ${new Date(result.createdAt).toLocaleDateString()}
Food: ${result.foodName}
Serving Size: ${result.servingSize || 'N/A'}
Health Score: ${result.healthMetrics?.healthScore || 'N/A'}/100
Status: ${result.isHealthy ? 'Healthy Choice' : 'Indulgent'}

Nutritional Info:
- Calories: ${result.calories} kcal
- Protein: ${result.macronutrients?.protein || result.protein}g
- Carbs: ${result.macronutrients?.carbs || result.carbs}g
- Fat: ${result.macronutrients?.fat || result.fat}g

Analysis:
${result.analysis}

Recommendation:
${result.recommendation}

Benefits:
${result.healthMetrics?.benefits?.map((b) => `- ${b}`).join('\n') || 'None'}

Concerns:
${result.healthMetrics?.concerns?.map((c) => `- ${c}`).join('\n') || 'None'}

Micronutrients:
${
  result.micronutrients
    ? Object.entries(result.micronutrients)
        .map(([k, v]) => `- ${k.replace(/([A-Z])/g, ' $1').trim()}: ${v}mg`)
        .join('\n')
    : 'N/A'
}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NutriLens-Report-${result.foodName.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className='flex items-center bg-black hover:bg-brand-primary text-brand-primary hover:text-black px-4 py-2 rounded-xl transition-colors text-sm font-medium border border-brand-primary/20'
    >
      <Download className='w-4 h-4 mr-2' /> Export
    </button>
  );
};
