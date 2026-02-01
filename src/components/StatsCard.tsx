import { useEffect, useState, useRef } from "react";

interface StatsCardProps {
  value: number;
  label: string;
  colorClass: string;
}

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number>();

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      countRef.current = Math.floor(easeOutQuart * end);
      setCount(countRef.current);

      if (percentage < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration]);

  return count;
}

export function StatsCard({ value, label, colorClass }: StatsCardProps) {
  const animatedValue = useCountUp(value);

  return (
    <div className="flex flex-col items-center p-6 bg-card rounded-2xl border border-border/50 card-hover shadow-card">
      <span className={`stat-number ${colorClass}`}>
        {animatedValue.toLocaleString()}
      </span>
      <span className="text-sm text-muted-foreground mt-2 font-medium">
        {label}
      </span>
    </div>
  );
}
