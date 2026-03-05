import type { PageProps } from "./types";

const RELIABILITY_OPTIONS = [
  { value: "best-effort", label: "Best Effort", desc: "Acceptable occasional downtime" },
  { value: "high-availability", label: "High Availability", desc: "99.9%+ uptime required" },
];

const COMPLIANCE_FLAGS = ["HIPAA", "GDPR", "SOC2", "PCI-DSS", "None"];

export default function PageNfr({ data, onChange }: PageProps) {
  const n = data.nfr;
  const set = (field: string, value: unknown) => onChange("nfr", { [field]: value });

  const toggleCompliance = (flag: string) => {
    if (flag === "None") {
      set("compliance", n.compliance.includes("None") ? [] : ["None"]);
      return;
    }
    const without = n.compliance.filter((f) => f !== "None");
    set("compliance", without.includes(flag) ? without.filter((f) => f !== flag) : [...without, flag]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-1">Non-Functional Requirements</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Define performance, scale, reliability, and compliance expectations.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Response Time Target</label>
          <input
            type="text"
            value={n.response_time}
            onChange={(e) => set("response_time", e.target.value)}
            placeholder="e.g. < 200ms p95"
            className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Throughput Target</label>
          <input
            type="text"
            value={n.throughput}
            onChange={(e) => set("throughput", e.target.value)}
            placeholder="e.g. 1000 req/s"
            className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Expected Users</label>
          <input
            type="text"
            value={n.expected_users}
            onChange={(e) => set("expected_users", e.target.value)}
            placeholder="e.g. 10,000"
            className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Concurrent Sessions</label>
          <input
            type="text"
            value={n.concurrent_sessions}
            onChange={(e) => set("concurrent_sessions", e.target.value)}
            placeholder="e.g. 500"
            className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Reliability Requirement</legend>
        <div className="grid grid-cols-2 gap-3">
          {RELIABILITY_OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex flex-col p-3 rounded-lg border cursor-pointer transition ${
                n.reliability === o.value
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                  : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]"
              }`}
            >
              <input type="radio" name="reliability" value={o.value} checked={n.reliability === o.value} onChange={() => set("reliability", o.value)} className="sr-only" />
              <span className="font-medium text-sm">{o.label}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{o.desc}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-3 p-3 rounded-lg border border-[hsl(var(--border))]">
        <label className="text-sm font-medium flex-1">Offline Support Required</label>
        <button
          type="button"
          onClick={() => set("offline_support", !n.offline_support)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            n.offline_support ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--border))]"
          }`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${n.offline_support ? "translate-x-5" : ""}`} />
        </button>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Compliance Flags</legend>
        <div className="flex flex-wrap gap-2">
          {COMPLIANCE_FLAGS.map((flag) => (
            <label
              key={flag}
              className={`px-3 py-1.5 rounded-md text-sm cursor-pointer border transition ${
                n.compliance.includes(flag)
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] text-[hsl(var(--primary))]"
                  : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]"
              }`}
            >
              <input type="checkbox" checked={n.compliance.includes(flag)} onChange={() => toggleCompliance(flag)} className="sr-only" />
              {flag}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
