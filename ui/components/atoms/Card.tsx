import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const card = {
  hidden: { opacity: 0, scale: 0 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      type: 'spring'
    }
  },
  shake: {
    opacity: 1,
    scale: 1,
    rotate: [0, 3, 0, 3, 0]
  }
};

const Card: React.FC<{
  shake?: boolean;
  children: React.ReactNode;
  className?: string;
  setShake?: any;
}> = ({ shake, children, className, setShake }) => {
  useEffect(() => {
    shake && setTimeout(() => setShake(false), 500);
  }, [shake]);

  return (
    <motion.div
      variants={card}
      initial="hidden"
      animate={shake ? 'shake' : 'show'}
      className={`bg-white shadow-md h-full md:max-h-[40rem] md:h-min md:min-h-[20rem] w-full md:w-[40rem] md:rounded-2xl py-4 px-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
