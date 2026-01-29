import { PageHeader } from "@/components/kit";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from "@/components/kit";
import { CodeBlock, CopyButton } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Key, Webhook, GitBranch, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [gitConfig, setGitConfig] = useState({
    repo: "",
    baseBranch: "main",
    pathPrefix: "docs/",
  });

  const sampleWebhookPayload = {
    event: "kit.ready",
    assemblyId: "asm_example123",
    projectName: "my-project",
    kitUrl: "https://api.axiom.dev/v1/assemblies/asm_example123/kit.zip?sig=...",
    timestamp: new Date().toISOString(),
    checksums: {
      manifestSha256: "abc123...",
      zipSha256: "def456...",
    },
  };

  const handleSaveGitConfig = () => {
    localStorage.setItem("axiom-git-config", JSON.stringify(gitConfig));
    toast({
      title: "Settings saved",
      description: "Git preset configuration has been saved locally.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Configure API keys, webhooks, and delivery presets"
      />

      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <GlassCardTitle>API Keys</GlassCardTitle>
          </div>
          <GlassCardDescription>
            Manage API keys for programmatic access to the Assembler API.
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
            <p>API key management coming soon.</p>
            <p className="mt-2 opacity-70">
              Use the /v1/assemblies endpoints with your session for now.
            </p>
          </div>
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            <GlassCardTitle>Webhook Test Tool</GlassCardTitle>
          </div>
          <GlassCardDescription>
            Generate sample payloads and signature headers for testing webhook receivers.
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Sample kit.ready Payload</Label>
            <CodeBlock
              code={JSON.stringify(sampleWebhookPayload, null, 2)}
              language="json"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Signature Header</Label>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg font-mono text-sm">
              <span className="text-muted-foreground">X-Assembler-Signature:</span>
              <span className="flex-1 truncate">sha256=hmac_signature_here</span>
              <CopyButton value="X-Assembler-Signature: sha256=hmac_signature_here" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Signatures are computed using HMAC-SHA256 with your webhook secret.
            </p>
          </div>
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <GlassCardTitle>Git Presets</GlassCardTitle>
          </div>
          <GlassCardDescription>
            Save default repository settings for git delivery type.
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="repo">Repository URL</Label>
              <Input
                id="repo"
                placeholder="https://github.com/org/repo"
                value={gitConfig.repo}
                onChange={(e) => setGitConfig({ ...gitConfig, repo: e.target.value })}
                data-testid="input-git-repo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Base Branch</Label>
              <Input
                id="branch"
                placeholder="main"
                value={gitConfig.baseBranch}
                onChange={(e) => setGitConfig({ ...gitConfig, baseBranch: e.target.value })}
                data-testid="input-git-branch"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="path">Path Prefix</Label>
            <Input
              id="path"
              placeholder="docs/"
              value={gitConfig.pathPrefix}
              onChange={(e) => setGitConfig({ ...gitConfig, pathPrefix: e.target.value })}
              data-testid="input-git-path"
            />
          </div>
          <Button onClick={handleSaveGitConfig} data-testid="button-save-git">
            <RefreshCw className="h-4 w-4 mr-2" />
            Save Preset
          </Button>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
