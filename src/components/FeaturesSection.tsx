import { Brain, MapPin, Scale, Bell } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

const features = [
  {
    icon: Brain,
    title: "Instant AI Analysis",
    description:
      "Multimodal vision AI identifies hazards and calculates urgency scores automatically.",
    iconVariant: "coral" as const,
  },
  {
    icon: MapPin,
    title: "Geospatial Risk Scoring",
    description:
      "Proximity to schools and hospitals determines priority for immediate action.",
    iconVariant: "teal" as const,
  },
  {
    icon: Scale,
    title: "Automated Legal Escalation",
    description:
      "AI drafts formal complaints and escalates to media if officials don't respond.",
    iconVariant: "primary" as const,
  },
  {
    icon: Bell,
    title: "Real-Time Notifications",
    description:
      "Get instant updates when your reports are reviewed, verified, or resolved.",
    iconVariant: "amber" as const,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            How <span className="gradient-text">CivicGuard AI</span> Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Our AI-powered platform makes civic engagement simple, effective, and rewarding.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="opacity-0 animate-fade-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
            >
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
