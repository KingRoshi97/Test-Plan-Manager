import { useState } from "react";
import { FileText, BookOpen, Layers, Globe, Code, Database } from "lucide-react";

const templateGroups = [
  {
    name: "Product Definition",
    icon: FileText,
    templates: ["BRP", "DMG", "PRD", "RISK", "RSC", "SMIP", "STK", "URD"],
    description: "Business requirements, product specs, stakeholder maps, and risk assessments",
  },
  {
    name: "Experience Design",
    icon: Layers,
    templates: ["A11YD", "CDX", "DES", "DSYS", "IAN", "IXD", "RLB", "VAP"],
    description: "Accessibility, design systems, interaction design, and visual patterns",
  },
  {
    name: "System Architecture",
    icon: Code,
    templates: ["APIG", "ARC", "ERR", "PMAD", "RTM", "SBDT", "SIC", "WFO"],
    description: "API design, architecture docs, error handling, and workflow orchestration",
  },
  {
    name: "Data & Information",
    icon: Database,
    templates: ["CACHE", "DATA", "DGL", "DLR", "DQV", "RPT", "SRCH"],
    description: "Caching strategies, data governance, lineage, quality, and search",
  },
];

const knowledgePillars = [
  {
    name: "IT_END_TO_END",
    count: 254,
    icon: Globe,
    domains: ["Foundations", "Software Delivery", "Data Systems", "Platform Ops"],
    description: "End-to-end IT knowledge covering infrastructure, delivery, data, and operations",
  },
  {
    name: "INDUSTRY_PLAYBOOKS",
    count: 58,
    icon: BookOpen,
    domains: ["Finance", "Healthcare", "Government", "Logistics", "Retail/E-commerce"],
    description: "Industry-specific compliance, workflows, data models, and integration patterns",
  },
  {
    name: "LANGUAGES_AND_LIBRARIES",
    count: 83,
    icon: Code,
    domains: ["JavaScript/TypeScript", "Python", "Go", "Rust", "Solidity/EVM", "PostgreSQL"],
    description: "Language-specific best practices, frameworks, security, and performance guides",
  },
];

type Tab = "templates" | "knowledge";

export default function DocInventoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("templates");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>Document Inventory</h1>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Templates and knowledge library overview</p>
      </div>

      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: "hsl(var(--muted))" }}>
        <button
          onClick={() => setActiveTab("templates")}
          className="px-4 py-2 text-sm rounded-md font-medium transition-colors"
          style={{
            background: activeTab === "templates" ? "hsl(var(--background))" : "transparent",
            color: activeTab === "templates" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
          }}
        >
          Templates (177)
        </button>
        <button
          onClick={() => setActiveTab("knowledge")}
          className="px-4 py-2 text-sm rounded-md font-medium transition-colors"
          style={{
            background: activeTab === "knowledge" ? "hsl(var(--background))" : "transparent",
            color: activeTab === "knowledge" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
          }}
        >
          Knowledge Library (395 KIDs)
        </button>
      </div>

      {activeTab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templateGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.name}
                className="rounded-lg border p-5"
                style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-md" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                    <Icon className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: "hsl(var(--card-foreground))" }}>{group.name}</h3>
                    <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {group.templates.length} templates
                    </span>
                  </div>
                </div>
                <p className="text-sm mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>{group.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.templates.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-md font-mono"
                      style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "knowledge" && (
        <div className="space-y-4">
          {knowledgePillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.name}
                className="rounded-lg border p-5"
                style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                      <Icon className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
                    </div>
                    <div>
                      <h3 className="font-semibold font-mono" style={{ color: "hsl(var(--card-foreground))" }}>{pillar.name}</h3>
                      <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{pillar.description}</p>
                    </div>
                  </div>
                  <span
                    className="text-2xl font-bold px-3"
                    style={{ color: "hsl(var(--primary))" }}
                  >
                    {pillar.count}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {pillar.domains.map((d) => (
                    <span
                      key={d}
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          <div
            className="rounded-lg border p-4 text-center text-sm"
            style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}
          >
            Total: 395 Knowledge Items across 3 pillars
          </div>
        </div>
      )}
    </div>
  );
}
