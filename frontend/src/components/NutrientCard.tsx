import React from 'react';

export interface NutrientCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  unit: string;
  color: string;
  textColor?: string;
  detail?: string;
}

export const NutrientCard: React.FC<NutrientCardProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  color,
  textColor,
  detail,
}) => (
  <div
    className={`group relative glass p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 border transition-colors duration-300 ${color}`}
  >
    {detail && (
      <div className='absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none'>
        {detail}
      </div>
    )}
    <Icon className={`w-6 h-6 ${textColor || 'text-current'}`} />
    <span className='text-xs font-medium uppercase tracking-wider opacity-70'>{label}</span>
    <div className='flex items-baseline space-x-1'>
      <span className='text-2xl font-bold'>{value}</span>
      <span className='text-xs opacity-70'>{unit}</span>
    </div>
  </div>
);
