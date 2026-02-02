import { PageHeader } from "@/components/kit";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Zap, Crown, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out Axiom Assembler",
    icon: Zap,
    features: [
      "5 kits per month",
      "Basic presets",
      "Community support",
      "Standard processing",
    ],
    limits: {
      kitsPerMonth: 5,
      apiCalls: 100,
    },
    cta: "Current Plan",
    disabled: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For individual developers and small teams",
    icon: Crown,
    popular: true,
    features: [
      "50 kits per month",
      "All presets & domains",
      "Priority support",
      "API access",
      "Custom templates",
      "Webhook deliveries",
    ],
    limits: {
      kitsPerMonth: 50,
      apiCalls: 1000,
    },
    cta: "Upgrade to Pro",
    disabled: false,
  },
  {
    id: "team",
    name: "Team",
    price: "$99",
    period: "per month",
    description: "For growing teams with advanced needs",
    icon: Building2,
    features: [
      "200 kits per month",
      "All Pro features",
      "Team collaboration",
      "Usage analytics",
      "SSO integration",
      "Dedicated support",
    ],
    limits: {
      kitsPerMonth: 200,
      apiCalls: 5000,
    },
    cta: "Upgrade to Team",
    disabled: false,
  },
];

export default function Billing() {
  const { user, isAuthenticated } = useAuth();
  const currentTier = user?.subscriptionTier || "free";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing & Plans"
        description="Manage your subscription and view usage"
        icon={CreditCard}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = plan.id === currentTier;
          
          return (
            <GlassCard key={plan.id} className={plan.popular ? "ring-2 ring-primary" : ""}>
              <GlassCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <GlassCardTitle>{plan.name}</GlassCardTitle>
                  </div>
                  {plan.popular && (
                    <Badge variant="default">Popular</Badge>
                  )}
                  {isCurrent && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
                <GlassCardDescription>{plan.description}</GlassCardDescription>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={isCurrent ? "secondary" : plan.popular ? "default" : "outline"}
                  disabled={isCurrent || !isAuthenticated}
                  data-testid={`button-select-plan-${plan.id}`}
                >
                  {isCurrent ? "Current Plan" : plan.cta}
                </Button>
              </GlassCardContent>
            </GlassCard>
          );
        })}
      </div>

      {isAuthenticated && (
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Current Usage</GlassCardTitle>
            <GlassCardDescription>
              Your usage resets monthly on the first of each month
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Kits Generated</span>
                  <span className="font-medium">
                    {user?.usageKitsGenerated || 0} / {plans.find(p => p.id === currentTier)?.limits.kitsPerMonth || 5}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(100, ((user?.usageKitsGenerated || 0) / (plans.find(p => p.id === currentTier)?.limits.kitsPerMonth || 5)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">API Calls</span>
                  <span className="font-medium">
                    {user?.usageApiCalls || 0} / {plans.find(p => p.id === currentTier)?.limits.apiCalls || 100}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(100, ((user?.usageApiCalls || 0) / (plans.find(p => p.id === currentTier)?.limits.apiCalls || 100)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      )}

      {!isAuthenticated && (
        <GlassCard>
          <GlassCardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Sign in to view your subscription and usage details.
            </p>
            <Button asChild>
              <a href="/api/login" data-testid="button-billing-login">Sign in</a>
            </Button>
          </GlassCardContent>
        </GlassCard>
      )}
    </div>
  );
}
