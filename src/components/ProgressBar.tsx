import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "accent" | "success" | "warning";
}

const sizeMap = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };
const colorMap = {
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercent = true,
  size = "md",
  color = "primary",
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          {label && <span className="font-medium text-card-foreground">{label}</span>}
          {showPercent && <span className="text-muted-foreground">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-muted ${sizeMap[size]}`}>
        <motion.div
          className={`${sizeMap[size]} rounded-full ${colorMap[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
