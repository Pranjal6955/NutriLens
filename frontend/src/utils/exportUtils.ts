import jsPDF from 'jspdf';
import 'jspdf-autotable';
// Extend jsPDF interface to include autoTable
import type { UserOptions } from 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => void;
  lastAutoTable: { finalY: number };
}
import type { MealData } from '../api';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const getFileName = (foodName: string, ext: string) => {
  return `NutriLens-Report-${foodName.replace(/\s+/g, '-')}.${ext}`;
};

const downloadFile = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generateTXT = (result: MealData) => {
  if (!result) return;
  const benefits =
    result.healthMetrics?.benefits && result.healthMetrics.benefits.length
      ? result.healthMetrics.benefits.map((b) => `- ${b}`).join('\n')
      : 'None';

  const concerns =
    result.healthMetrics?.concerns && result.healthMetrics.concerns.length
      ? result.healthMetrics.concerns.map((c) => `- ${c}`).join('\n')
      : 'None';

  const micronutrients = result.micronutrients
    ? Object.entries(result.micronutrients)
        .map(([k, v]) => `- ${k.replace(/([A-Z])/g, ' $1').trim()}: ${v}`)
        .join('\n')
    : 'N/A';

  const report = `
NutriLens Analysis Report
-------------------------
Date: ${formatDate(result.createdAt)}
Food: ${result.foodName}
Serving Size: ${result.servingSize || 'N/A'}
Health Score: ${result.healthMetrics?.healthScore ?? 'N/A'}/100
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
${benefits}

Concerns:
${concerns}

Micronutrients:
${micronutrients}
  `.trim();

  const blob = new Blob([report], { type: 'text/plain' });
  downloadFile(blob, getFileName(result.foodName, 'txt'));
};

export const generateCSV = (result: MealData) => {
  if (!result) return;

  // Define CSV headers and rows
  const rows = [
    ['Category', 'Detail', 'Value', 'Unit'],
    ['General', 'Date', formatDate(result.createdAt), ''],
    ['General', 'Food Name', result.foodName, ''],
    ['General', 'Serving Size', result.servingSize || 'N/A', ''],
    ['General', 'Health Score', `${result.healthMetrics?.healthScore || 'N/A'}`, '/100'],
    ['General', 'Status', result.isHealthy ? 'Healthy Choice' : 'Indulgent', ''],
    ['Macros', 'Calories', `${result.calories}`, 'kcal'],
    ['Macros', 'Protein', `${result.macronutrients?.protein || result.protein}`, 'g'],
    ['Macros', 'Carbs', `${result.macronutrients?.carbs || result.carbs}`, 'g'],
    ['Macros', 'Fat', `${result.macronutrients?.fat || result.fat}`, 'g'],

    ['Analysis', 'Summary', `"${result.analysis.replace(/"/g, '""')}"`, ''],
    ['Analysis', 'Recommendation', `"${result.recommendation.replace(/"/g, '""')}"`, ''],
  ];

  if (result.healthMetrics?.benefits) {
    result.healthMetrics.benefits.forEach((b, i) => {
      rows.push(['Benefits', `Benefit ${i + 1}`, `"${b.replace(/"/g, '""')}"`, '']);
    });
  }

  if (result.healthMetrics?.concerns) {
    result.healthMetrics.concerns.forEach((c, i) => {
      rows.push(['Concerns', `Concern ${i + 1}`, `"${c.replace(/"/g, '""')}"`, '']);
    });
  }

  if (result.micronutrients) {
    Object.entries(result.micronutrients).forEach(([key, value]) => {
      rows.push(['Micronutrients', key.replace(/([A-Z])/g, ' $1').trim(), `${value}`, 'mg']);
    });
  }

  const csvContent = rows.map((e) => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, getFileName(result.foodName, 'csv'));
};

export const generatePDF = (result: MealData) => {
  if (!result) return;
  const doc = new jsPDF() as jsPDFWithAutoTable;

  // Title
  doc.setFontSize(20);
  doc.text('NutriLens Analysis Report', 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  // General Info Table
  const generalData = [
    ['Food Name', result.foodName],
    ['Date Analysis', formatDate(result.createdAt)],
    ['Serving Size', result.servingSize || 'N/A'],
    ['Health Score', `${result.healthMetrics?.healthScore || 'N/A'} / 100`],
    ['Status', result.isHealthy ? 'Healthy Choice' : 'Indulgent'],
  ];

  doc.autoTable({
    startY: 40,
    head: [['Metric', 'Value']],
    body: generalData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
  });

  // Macros Table
  const macroData = [
    ['Calories', `${result.calories} kcal`],
    ['Protein', `${result.macronutrients?.protein || result.protein} g`],
    ['Carbs', `${result.macronutrients?.carbs || result.carbs} g`],
    ['Fat', `${result.macronutrients?.fat || result.fat} g`],
  ];

  let finalY = doc.lastAutoTable.finalY + 10;
  doc.text('Nutritional Information', 14, finalY);

  doc.autoTable({
    startY: finalY + 5,
    head: [['Nutrient', 'Amount']],
    body: macroData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Analysis & Recommendation
  finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Analysis', 14, finalY);
  doc.setFontSize(10);
  doc.setTextColor(50);
  const splitAnalysis = doc.splitTextToSize(result.analysis, 180);
  doc.text(splitAnalysis, 14, finalY + 5);

  finalY = finalY + 10 + splitAnalysis.length * 4; // Estimate height

  if (finalY > 270) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Recommendation', 14, finalY);
  doc.setFontSize(10);
  doc.setTextColor(50);
  const splitRec = doc.splitTextToSize(result.recommendation, 180);
  doc.text(splitRec, 14, finalY + 5);

  finalY = finalY + 10 + splitRec.length * 4;

  // Check page break for lists
  if (finalY > 250) {
    doc.addPage();
    finalY = 20;
  }

  // Benefits
  if (result.healthMetrics?.benefits?.length) {
    doc.setFontSize(12);
    doc.setTextColor(0, 100, 0); // Dark Green
    doc.text('Benefits', 14, finalY);
    doc.setFontSize(10);
    doc.setTextColor(50);
    result.healthMetrics.benefits.forEach((b) => {
      finalY += 5;
      doc.text(`• ${b}`, 14, finalY);
    });
    finalY += 10;
  }

  // Concerns
  if (result.healthMetrics?.concerns?.length) {
    if (finalY > 260) {
      doc.addPage();
      finalY = 20;
    }
    doc.setFontSize(12);
    doc.setTextColor(150, 0, 0); // Dark Red
    doc.text('Concerns', 14, finalY);
    doc.setFontSize(10);
    doc.setTextColor(50);
    result.healthMetrics.concerns.forEach((c) => {
      finalY += 5;
      doc.text(`• ${c}`, 14, finalY);
    });
  }

  doc.save(getFileName(result.foodName, 'pdf'));
};
