import { useState } from "react";
import { PageHeader } from "@/components/kit";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bell, Mail, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? true);
  const [emailOnKitReady, setEmailOnKitReady] = useState(user?.emailOnKitReady ?? true);
  const [emailOnDeliveryComplete, setEmailOnDeliveryComplete] = useState(user?.emailOnDeliveryComplete ?? true);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: {
      emailNotifications?: boolean;
      emailOnKitReady?: boolean;
      emailOnDeliveryComplete?: boolean;
    }) => {
      return apiRequest("PATCH", "/api/user/preferences", preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Preferences saved", description: "Your notification preferences have been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save preferences", variant: "destructive" });
    },
  });

  const handleToggle = (field: string, value: boolean) => {
    if (field === "emailNotifications") {
      setEmailNotifications(value);
      updatePreferencesMutation.mutate({ emailNotifications: value });
    } else if (field === "emailOnKitReady") {
      setEmailOnKitReady(value);
      updatePreferencesMutation.mutate({ emailOnKitReady: value });
    } else if (field === "emailOnDeliveryComplete") {
      setEmailOnDeliveryComplete(value);
      updatePreferencesMutation.mutate({ emailOnDeliveryComplete: value });
    }
  };

  const getInitials = () => {
    if (!user) return "?";
    const first = user.firstName?.charAt(0) || "";
    const last = user.lastName?.charAt(0) || "";
    if (first || last) return `${first}${last}`.toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  if (isLoading) {
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
          title="Profile"
          description="Manage your account settings"
          icon={User}
        />
        <GlassCard>
          <GlassCardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Sign in to view and manage your profile settings.
            </p>
            <Button asChild>
              <a href="/api/login" data-testid="button-profile-login">Sign in</a>
            </Button>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        description="Manage your account settings and preferences"
        icon={User}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <GlassCardTitle>Account Information</GlassCardTitle>
            </div>
            <GlassCardDescription>
              Your profile details from your login provider
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg" data-testid="text-profile-name">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-muted-foreground" data-testid="text-profile-email">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="grid gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Member since</span>
                <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Subscription</span>
                <span className="capitalize">{user?.subscriptionTier || "Free"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Kits generated</span>
                <span>{user?.usageKitsGenerated || 0}</span>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <GlassCardTitle>Notification Preferences</GlassCardTitle>
            </div>
            <GlassCardDescription>
              Control which email notifications you receive
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your account
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={(v) => handleToggle("emailNotifications", v)}
                disabled={updatePreferencesMutation.isPending}
                data-testid="switch-email-notifications"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="kit-ready">Kit Ready Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when your kit is ready to download
                </p>
              </div>
              <Switch
                id="kit-ready"
                checked={emailOnKitReady}
                onCheckedChange={(v) => handleToggle("emailOnKitReady", v)}
                disabled={updatePreferencesMutation.isPending || !emailNotifications}
                data-testid="switch-kit-ready"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="delivery-complete">Delivery Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when deliveries complete or fail
                </p>
              </div>
              <Switch
                id="delivery-complete"
                checked={emailOnDeliveryComplete}
                onCheckedChange={(v) => handleToggle("emailOnDeliveryComplete", v)}
                disabled={updatePreferencesMutation.isPending || !emailNotifications}
                data-testid="switch-delivery-complete"
              />
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <GlassCardTitle>Security</GlassCardTitle>
          </div>
          <GlassCardDescription>
            Manage your account security settings
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">API Keys</p>
              <p className="text-sm text-muted-foreground">
                Manage your API keys for programmatic access
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/ops" data-testid="link-manage-api-keys">Manage Keys</a>
            </Button>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
