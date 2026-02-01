import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconVariant: "coral" | "teal" | "primary" | "amber";
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  iconVariant,
}: FeatureCardProps) {
  return (
    <div className="group relative flex flex-col p-6 bg-card rounded-2xl border border-border/50 card-hover shadow-card">
      {/* Icon Badge */}
      <div className={`icon-badge icon-badge-${iconVariant} mb-5 transition-transform group-hover:scale-110`}>
        <Icon className="h-6 w-6" />
      </div>

      {/* Content */}
      <h3 className="font-display text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
