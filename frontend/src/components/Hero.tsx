import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='text-center space-y-6 mb-12'
    >
      <h1 className='text-5xl md:text-7xl font-extrabold tracking-tight'>
        Know What You <span className='text-brand-primary'>Eat.</span>
      </h1>
      <p className='text-lg md:text-xl max-w-2xl mx-auto opacity-70'>
        Snap a photo of your meal and get instant nutritional insights powered by advanced AI. Track
        calories, macros, and get personalized recommendations.
      </p>
    </motion.div>
  );
};
