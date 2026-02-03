import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, CodeBlock, CopyButton } from "@/components/kit";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, GlassCardDescription } from "@/components/kit";

function EndpointCard({ 
  method, 
  path, 
  description, 
  requestExample, 
  responseExample,
  notes 
}: { 
  method: string; 
  path: string; 
  description: string; 
  requestExample?: string;
  responseExample: string;
  notes?: string;
}) {
  const methodColors: Record<string, string> = {
    GET: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    POST: "bg-green-500/10 text-green-500 border-green-500/20",
    DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  
  return (
    <GlassCard className="mb-4">
      <GlassCardHeader className="pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={methodColors[method]}>{method}</Badge>
          <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{path}</code>
          <CopyButton value={path} size="icon" variant="ghost" />
        </div>
        <GlassCardDescription>{description}</GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent className="space-y-4">
        {requestExample && (
          <div>
            <p className="text-sm font-medium mb-2">Request</p>
            <CodeBlock code={requestExample} language="json" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium mb-2">Response</p>
          <CodeBlock code={responseExample} language="json" />
        </div>
        {notes && (
          <p className="text-sm text-muted-foreground">{notes}</p>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}

export default function ApiDocs() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Assembler API v1"
        subtitle="Universal delivery API for generating and delivering Axiom kits to AI coding agents"
      />

      <Tabs defaultValue="assemblies" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assemblies" data-testid="tab-assemblies">Assemblies</TabsTrigger>
          <TabsTrigger value="deliveries" data-testid="tab-deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="types" data-testid="tab-types">Delivery Types</TabsTrigger>
        </TabsList>

        <TabsContent value="assemblies" className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Assembly Endpoints</h2>
          
          <EndpointCard
            method="POST"
            path="/v1/assemblies"
            description="Create a new assembly and start the pipeline"
            requestExample={`{
  "projectName": "My Project",
  "idea": "Build a todo app with priorities and due dates",
  "preset": "axiom-assembler",
  "domains": ["platform", "api", "web"]
}`}
            responseExample={`{
  "assemblyId": "asm_abc123",
  "state": "queued",
  "statusUrl": "/v1/assemblies/asm_abc123"
}`}
            notes="Returns 202 Accepted. The pipeline runs asynchronously."
          />

          <EndpointCard
            method="GET"
            path="/v1/assemblies/{assemblyId}"
            description="Get assembly status, progress, and kit info"
            responseExample={`{
  "assembly": {
    "assemblyId": "asm_abc123",
    "state": "completed",
    "step": "package",
    "progress": { "percent": 100 },
    "kit": {
      "available": true,
      "zipBytes": 37402,
      "zipSha256": "0a93...",
      "manifestSha256": "e95c...",
      "agentPromptSha256": "fa33..."
    }
  },
  "logsTail": ""
}`}
            notes="States: queued, running, completed, failed, canceled"
          />

          <EndpointCard
            method="GET"
            path="/v1/assemblies/{assemblyId}/kit"
            description="Get kit metadata with signed download URL"
            responseExample={`{
  "assemblyId": "asm_abc123",
  "kit": {
    "kitVersion": "0.2.0",
    "entryDocs": ["docs/assembler_v1/README.md", ...],
    "commandsToRun": ["npm run assembler:review", ...],
    "implementationPlan": [...],
    "checksums": {
      "zipSha256": "...",
      "manifestSha256": "...",
      "agentPromptSha256": "..."
    },
    "sizes": { "zipBytes": 37402 },
    "download": {
      "zipUrl": "https://.../kit.zip?exp=...&sig=...",
      "expiresAt": "2026-01-29T06:00:00Z"
    }
  }
}`}
          />

          <EndpointCard
            method="GET"
            path="/v1/assemblies/{assemblyId}/kit.zip"
            description="Download the kit zip file"
            responseExample={`(binary zip file)`}
            notes="Supports signed URL auth via ?exp=...&sig=... query params"
          />
        </TabsContent>

        <TabsContent value="deliveries" className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Delivery Endpoints</h2>
          
          <EndpointCard
            method="POST"
            path="/v1/assemblies/{assemblyId}/deliveries"
            description="Create a delivery to deliver the kit"
            requestExample={`{
  "type": "pull",
  "label": "Agent Download",
  "config": {
    "expiresInSeconds": 3600,
    "includeInlinePrompt": true,
    "includeInlineManifest": true
  }
}`}
            responseExample={`{
  "delivery": {
    "deliveryId": "del_123",
    "assemblyId": "asm_abc123",
    "type": "pull",
    "state": "completed",
    "result": {
      "zipUrl": "https://.../kit.zip?...",
      "expiresAt": "...",
      "zipSha256": "...",
      "manifest": {...},
      "agentPrompt": "..."
    }
  }
}`}
          />

          <EndpointCard
            method="GET"
            path="/v1/assemblies/{assemblyId}/deliveries"
            description="List all deliveries for an assembly"
            responseExample={`{
  "assemblyId": "asm_abc123",
  "deliveries": [
    { "deliveryId": "del_123", "type": "pull", "state": "completed", ... }
  ]
}`}
          />

          <EndpointCard
            method="GET"
            path="/v1/deliveries/{deliveryId}"
            description="Get delivery details with attempt history"
            responseExample={`{
  "delivery": {
    "deliveryId": "del_123",
    "state": "completed",
    "attempts": 1,
    "maxAttempts": 6,
    "result": {...}
  },
  "attemptHistory": [
    { "attempt": 1, "at": "...", "ok": true }
  ]
}`}
          />

          <EndpointCard
            method="POST"
            path="/v1/deliveries/{deliveryId}/retry"
            description="Retry a failed delivery"
            responseExample={`{
  "ok": true,
  "deliveryId": "del_123"
}`}
          />
        </TabsContent>

        <TabsContent value="types" className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Delivery Types</h2>
          
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Pull (Universal)</GlassCardTitle>
              <GlassCardDescription>Returns signed download URL. Works everywhere.</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <CodeBlock code={`{
  "type": "pull",
  "config": {
    "expiresInSeconds": 3600,
    "includeInlinePrompt": true,
    "includeInlineManifest": true
  }
}`} language="json" />
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Webhook (Automation)</GlassCardTitle>
              <GlassCardDescription>Pushes event to your endpoint when kit is ready.</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <CodeBlock code={`{
  "type": "webhook",
  "config": {
    "url": "https://your-server.com/assembler/webhook",
    "secret": "your-signing-secret",
    "events": ["kit.ready", "kit.failed"],
    "include": ["zipUrl", "manifest", "agentPrompt"]
  }
}`} language="json" />
              <div>
                <p className="text-sm font-medium mb-2">Webhook Headers</p>
                <CodeBlock code={`X-Assembler-Timestamp: <unix seconds>
X-Assembler-Nonce: <random string>
X-Assembler-Signature: sha256=<hmac>`} language="text" />
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Git (Dev-Native)</GlassCardTitle>
              <GlassCardDescription>Pushes kit to a Git repo branch or PR.</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <CodeBlock code={`{
  "type": "git",
  "config": {
    "provider": "github",
    "repo": "org/repo",
    "branch": "assembler/asm_abc123",
    "mode": "pr",
    "auth": { "token": "GITHUB_TOKEN" },
    "pathPrefix": "axiom_kit"
  }
}`} language="json" />
              <p className="text-sm text-muted-foreground mt-4">
                Note: Git delivery requires GitHub token with repo write permissions.
              </p>
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Direct (Platform Adapters)</GlassCardTitle>
              <GlassCardDescription>Platform-specific delivery where APIs exist.</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <CodeBlock code={`{
  "type": "direct",
  "config": {
    "adapter": "replit|loveable|custom-agent-runner",
    "connection": { "apiKey": "...", "projectId": "..." },
    "options": { "autoStart": true }
  }
}`} language="json" />
              <p className="text-sm text-muted-foreground mt-4">
                Note: Direct adapters are platform-specific and require API support.
              </p>
            </GlassCardContent>
          </GlassCard>
        </TabsContent>
      </Tabs>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Quick Start</GlassCardTitle>
          <GlassCardDescription>Generate and retrieve a kit in 3 steps</GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">1. Create an assembly</p>
            <CodeBlock code={`curl -X POST /v1/assemblies \\
  -H "Content-Type: application/json" \\
  -d '{"idea": "Build a todo app"}'`} language="bash" />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">2. Poll for completion</p>
            <CodeBlock code={`curl /v1/assemblies/{assemblyId}`} language="bash" />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">3. Get kit with delivery</p>
            <CodeBlock code={`curl -X POST /v1/assemblies/{assemblyId}/deliveries \\
  -H "Content-Type: application/json" \\
  -d '{"type": "pull", "config": {"includeInlinePrompt": true}}'`} language="bash" />
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
