import React, { useEffect, useState } from "react";

interface CountUpProps {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const CountUp: React.FC<CountUpProps> = ({
  end,
  duration = 1.5,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * end);
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  const formatted = decimals > 0
    ? current.toFixed(decimals)
    : Math.round(current).toLocaleString();

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
};

export default CountUp;
