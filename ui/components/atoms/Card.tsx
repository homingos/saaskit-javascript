import { AnimatePresence, motion } from 'framer-motion';

const card = {
  hidden: { opacity: 0, scale: 0 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.1,
      type: 'spring',
      damping: 25,
      stiffness: 500
    }
  }
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return (
    <motion.div
      variants={card}
      initial="hidden"
      animate="show"
      className={`bg-white shadow-md h-full md:max-h-[40rem] md:h-min md:min-h-[20rem] w-full md:w-[40rem] md:rounded-2xl py-4 px-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
