import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles, Activity } from 'lucide-react';

const steps = [
  {
    icon: Camera,
    title: 'Snap & Upload',
    description: 'Take a photo of your meal or upload an image from your gallery.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: Sparkles,
    title: 'AI Analysis',
    description: 'Our advanced AI scans the image to identify ingredients and portion sizes.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    icon: Activity,
    title: 'Get Insights',
    description:
      'Receive instant nutritional breakdowns including calories, macros, and health tips.',
    color: 'text-brand-primary',
    bgColor: 'bg-brand-primary/10',
    borderColor: 'border-brand-primary/20',
  },
];

export const Reproduce: React.FC = () => {
  return (
    <section className='py-24 relative'>
      <div className='text-center mb-20'>
        <h2 className='text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-green-400'>
          How NutriLens Works
        </h2>
        <p className='text-xl text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto'>
          Track your nutrition in three simple steps
        </p>
      </div>

      <div className='max-w-6xl mx-auto px-4 relative'>
        {/* Center Connecting Line (Desktop) */}
        <div className='absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gray-200 dark:via-gray-700 to-transparent -translate-x-1/2 hidden md:block' />

        <div className='space-y-24'>
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`relative z-10 flex flex-col md:flex-row items-center gap-16 ${
                  isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Text Content */}
                <div
                  className={`flex-1 flex flex-col items-center md:block opacity-90 hover:opacity-100 transition-opacity order-2 md:order-1 ${
                    isEven ? 'md:text-right' : 'md:text-left'
                  }`}
                >
                  <h3 className='text-3xl font-bold mb-4 group-hover:text-brand-primary transition-colors'>
                    {step.title}
                  </h3>
                  <p className='text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg mx-auto md:mx-0 inline-block'>
                    {step.description}
                  </p>
                </div>

                {/* Center Icon */}
                <div className='shrink-0 relative order-1 md:order-2'>
                  <div
                    className={`w-24 h-24 rounded-3xl ${step.bgColor} ${step.color} border-2 ${step.borderColor} flex items-center justify-center shadow-lg backdrop-blur-sm bg-white dark:bg-black z-10 relative transform hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className='w-12 h-12' />
                  </div>
                </div>

                {/* Empty Spacer for Balance */}
                <div className='flex-1 hidden md:block order-3' />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
