import { Camera, MapPin, CheckCircle, Award } from "lucide-react";

const steps = [
  {
    icon: Camera,
    step: "01",
    title: "Report",
    description: "Snap a photo of any urban hazard — potholes, broken streetlights, or unsafe conditions.",
  },
  {
    icon: MapPin,
    step: "02",
    title: "Track",
    description: "Monitor your report's status in real-time as it moves through the system.",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Verify",
    description: "Community members verify reports to increase credibility and priority.",
  },
  {
    icon: Award,
    step: "04",
    title: "Earn",
    description: "Gain points and badges for your civic contributions and climb the leaderboard.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Your Journey with <span className="gradient-text">CivicGuard</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From spotting a problem to seeing it solved — here's how you make a difference.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div
                key={item.step}
                className="relative flex flex-col items-center text-center opacity-0 animate-fade-up"
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: "forwards" }}
              >
                {/* Step Number */}
                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-card border-2 border-primary shadow-glow mb-6">
                  <item.icon className="h-8 w-8 text-primary" />
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {item.step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[250px]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
