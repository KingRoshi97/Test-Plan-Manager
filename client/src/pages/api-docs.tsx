import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function CodeBlock({ code, language = "json" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative group">
      <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
        data-testid="button-copy-code"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

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
    GET: "bg-blue-500",
    POST: "bg-green-500",
    DELETE: "bg-red-500",
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Badge className={`${methodColors[method]} text-white`}>{method}</Badge>
          <code className="text-sm font-mono">{path}</code>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {requestExample && (
          <div>
            <p className="text-sm font-medium mb-2">Request</p>
            <CodeBlock code={requestExample} />
          </div>
        )}
        <div>
          <p className="text-sm font-medium mb-2">Response</p>
          <CodeBlock code={responseExample} />
        </div>
        {notes && (
          <p className="text-sm text-muted-foreground">{notes}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DocsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/create">
          <Button variant="ghost" size="sm" data-testid="link-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Assembler API v1</h1>
        <p className="text-muted-foreground">
          Universal delivery API for generating and delivering Axiom kits to AI coding agents.
        </p>
      </div>

      <Tabs defaultValue="assemblies" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assemblies" data-testid="tab-assemblies">Assemblies</TabsTrigger>
          <TabsTrigger value="deliveries" data-testid="tab-deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="types" data-testid="tab-types">Delivery Types</TabsTrigger>
        </TabsList>

        <TabsContent value="assemblies" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Assembly Endpoints</h2>
          
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

        <TabsContent value="deliveries" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Endpoints</h2>
          
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

        <TabsContent value="types" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Types</h2>
          
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Pull (Universal)</CardTitle>
              <CardDescription>Returns signed download URL. Works everywhere.</CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock code={`{
  "type": "pull",
  "config": {
    "expiresInSeconds": 3600,
    "includeInlinePrompt": true,
    "includeInlineManifest": true
  }
}`} />
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Webhook (Automation)</CardTitle>
              <CardDescription>Pushes event to your endpoint when kit is ready.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CodeBlock code={`{
  "type": "webhook",
  "config": {
    "url": "https://your-server.com/assembler/webhook",
    "secret": "your-signing-secret",
    "events": ["kit.ready", "kit.failed"],
    "include": ["zipUrl", "manifest", "agentPrompt"]
  }
}`} />
              <div>
                <p className="text-sm font-medium mb-2">Webhook Headers</p>
                <CodeBlock code={`X-Assembler-Timestamp: <unix seconds>
X-Assembler-Nonce: <random string>
X-Assembler-Signature: sha256=<hmac>`} />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Git (Dev-Native)</CardTitle>
              <CardDescription>Pushes kit to a Git repo branch or PR.</CardDescription>
            </CardHeader>
            <CardContent>
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
}`} />
              <p className="text-sm text-muted-foreground mt-2">
                Note: Git delivery requires GitHub token with repo write permissions.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Direct (Platform Adapters)</CardTitle>
              <CardDescription>Platform-specific delivery where APIs exist.</CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock code={`{
  "type": "direct",
  "config": {
    "adapter": "replit|loveable|custom-agent-runner",
    "connection": { "apiKey": "...", "projectId": "..." },
    "options": { "autoStart": true }
  }
}`} />
              <p className="text-sm text-muted-foreground mt-2">
                Note: Direct adapters are platform-specific and require API support.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Generate and retrieve a kit in 3 steps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">1. Create an assembly</p>
            <CodeBlock code={`curl -X POST /v1/assemblies \\
  -H "Content-Type: application/json" \\
  -d '{"idea": "Build a todo app"}'`} />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">2. Poll for completion</p>
            <CodeBlock code={`curl /v1/assemblies/{assemblyId}`} />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">3. Get kit with delivery</p>
            <CodeBlock code={`curl -X POST /v1/assemblies/{assemblyId}/deliveries \\
  -H "Content-Type: application/json" \\
  -d '{"type": "pull", "config": {"includeInlinePrompt": true}}'`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
