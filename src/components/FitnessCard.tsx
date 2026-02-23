import React from "react";

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
    <div
      onClick={onClick}
      className={`rounded-2xl border border-border bg-card p-6 shadow-fitness transition-all duration-300 hover:shadow-fitness-hover ${
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
    </div>
  );
};

export default FitnessCard;
