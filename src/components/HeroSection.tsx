import { Shield, Camera, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "./StatsCard";
import { useNavigate } from "react-router-dom";

const stats = [
  { value: 1234, label: "Reports Filed", color: "text-primary" },
  { value: 892, label: "Issues Resolved", color: "text-emerald" },
  { value: 5678, label: "Active Users", color: "text-teal" },
];

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="container">
        {/* Logo & Title */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Shield Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-6 shadow-glow animate-float">
            <Shield className="h-8 w-8" />
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            <span className="gradient-text-hero">CivicGuard AI</span>
          </h1>

          {/* Tagline */}
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
            <span className="gradient-text">AI-Powered Civic Action.</span>
          </h2>

          {/* Highlight Box */}
          <div className="mb-6">
            <span className="highlight-box text-xl md:text-2xl lg:text-3xl">
              Turn Potholes into Policy.
            </span>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
            Your AI legal advocate for urban accountability. Report hazards, track responses, and ensure action.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button 
              size="lg" 
              className="gap-2 text-base px-8 h-12 shadow-glow"
              onClick={() => navigate('/report')}
            >
              <Camera className="h-5 w-5" />
              Scan a Hazard
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-2 text-base px-8 h-12"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn How It Works
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl">
            {stats.map((stat) => (
              <StatsCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                colorClass={stat.color}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
