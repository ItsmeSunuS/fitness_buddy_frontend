import React from "react";
import { motion } from "framer-motion";

interface FitnessCardProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const FitnessCard: React.FC<FitnessCardProps> = ({ title, subtitle, icon, children, className = "", onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`rounded-2xl border border-border bg-card p-6 shadow-fitness transition-shadow duration-300 hover:shadow-fitness-hover ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {(title || icon) && (
        <div className="mb-4 flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <div>
            {title && <h3 className="font-display text-lg font-semibold text-card-foreground">{title}</h3>}
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </motion.div>
  );
};

export default FitnessCard;
