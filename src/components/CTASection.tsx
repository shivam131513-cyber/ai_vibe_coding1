import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-teal/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container">
        <div className="relative bg-card rounded-3xl border border-border/50 p-8 md:p-16 shadow-xl overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
            {/* Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-8 shadow-glow">
              <Shield className="h-8 w-8" />
            </div>

            {/* Title */}
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Ready to Make Your City Better?
            </h2>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Join thousands of civic champions using AI to hold local governments accountable. Start reporting hazards today.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2 text-base px-8 h-12 shadow-glow">
                <Shield className="h-5 w-5" />
                Get Started Free
              </Button>
              <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-12">
                View Demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
