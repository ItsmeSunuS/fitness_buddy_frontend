import React from "react";
import { motion } from "framer-motion";

interface AnimatedCardProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, index = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      duration: 0.45,
      delay: index * 0.08,
      ease: [0.25, 0.46, 0.45, 0.94],
    }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className={className}
  >
    {children}
  </motion.div>
);

export default AnimatedCard;
