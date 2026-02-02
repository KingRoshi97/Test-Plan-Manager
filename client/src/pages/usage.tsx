import { PageHeader } from "@/components/kit";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Clock, Zap, Package, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

interface UsageStats {
  kitsGenerated: number;
  apiCalls: number;
  activeDeliveries: number;
  templatesCreated: number;
  kitsThisMonth: number;
  averageKitTime: number;
}

export default function Usage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<UsageStats>({
    queryKey: ["/api/user/usage"],
    enabled: isAuthenticated,
  });

  const isLoading = authLoading || statsLoading;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Usage & Analytics"
          description="Track your kit generation and API usage"
          icon={BarChart3}
        />
        <GlassCard>
          <GlassCardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Sign in to view your usage analytics.
            </p>
            <Button asChild>
              <a href="/api/login" data-testid="button-usage-login">Sign in</a>
            </Button>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Kits",
      value: stats?.kitsGenerated ?? user?.usageKitsGenerated ?? 0,
      description: "All-time kits generated",
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "API Calls",
      value: stats?.apiCalls ?? user?.usageApiCalls ?? 0,
      description: "This billing period",
      icon: Zap,
      color: "text-amber-500",
    },
    {
      title: "This Month",
      value: stats?.kitsThisMonth ?? 0,
      description: "Kits generated this month",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Avg. Build Time",
      value: stats?.averageKitTime ? `${stats.averageKitTime}s` : "N/A",
      description: "Average kit generation time",
      icon: Clock,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Usage & Analytics"
        description="Track your kit generation and API usage"
        icon={BarChart3}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={stat.title}>
              <GlassCardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s/g, "-")}`}>
                      {isLoading ? "-" : stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color} opacity-70`} />
                </div>
              </GlassCardContent>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Monthly Usage Trend</GlassCardTitle>
            <GlassCardDescription>
              Your kit generation over the past 6 months
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Charts coming soon</p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Usage by Preset</GlassCardTitle>
            <GlassCardDescription>
              Distribution of your kit types
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Charts coming soon</p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Plan Limits</GlassCardTitle>
          <GlassCardDescription>
            Your current subscription usage
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Kits Generated</span>
                <span className="font-medium">{user?.usageKitsGenerated || 0} / 5</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, ((user?.usageKitsGenerated || 0) / 5) * 100)}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">API Calls</span>
                <span className="font-medium">{user?.usageApiCalls || 0} / 100</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, ((user?.usageApiCalls || 0) / 100) * 100)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50">
            <Button variant="outline" asChild>
              <a href="/billing" data-testid="link-upgrade-plan">Upgrade Plan</a>
            </Button>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
