import React from 'react';

export interface NutrientCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  unit: string;
  color: string;
  textColor?: string;
}

export const NutrientCard: React.FC<NutrientCardProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  color,
  textColor,
}) => (
  <div
    className={`glass p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 border transition-colors duration-300 ${color}`}
  >
    <Icon className={`w-6 h-6 ${textColor || 'text-current'}`} />
    <span className='text-xs font-medium uppercase tracking-wider opacity-70'>{label}</span>
    <div className='flex items-baseline space-x-1'>
      <span className='text-2xl font-bold'>{value}</span>
      <span className='text-xs opacity-70'>{unit}</span>
    </div>
  </div>
);
