import type { PageProps } from "./types";

const inputCls = "w-full px-3 py-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--glass-border))] text-[hsl(var(--foreground))] font-mono-tech text-sm focus:outline-none focus:border-[hsl(var(--glow-cyan)/0.5)] focus:shadow-[0_0_8px_hsl(var(--glow-cyan)/0.15)] transition placeholder:text-[hsl(var(--muted-foreground)/0.5)]";

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
        <h2 className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))] mb-1">Non-Functional Requirements</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Define performance, scale, reliability, and compliance expectations.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-system-label">Response Time Target</label>
          <input
            type="text"
            value={n.response_time}
            onChange={(e) => set("response_time", e.target.value)}
            placeholder="e.g. < 200ms p95"
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-system-label">Throughput Target</label>
          <input
            type="text"
            value={n.throughput}
            onChange={(e) => set("throughput", e.target.value)}
            placeholder="e.g. 1000 req/s"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-system-label">Expected Users</label>
          <input
            type="text"
            value={n.expected_users}
            onChange={(e) => set("expected_users", e.target.value)}
            placeholder="e.g. 10,000"
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-system-label">Concurrent Sessions</label>
          <input
            type="text"
            value={n.concurrent_sessions}
            onChange={(e) => set("concurrent_sessions", e.target.value)}
            placeholder="e.g. 500"
            className={inputCls}
          />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-system-label">Reliability Requirement</legend>
        <div className="grid grid-cols-2 gap-3">
          {RELIABILITY_OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex flex-col p-3 rounded-lg border cursor-pointer transition ${
                n.reliability === o.value
                  ? "border-[hsl(var(--glow-cyan)/0.5)] bg-[hsl(var(--glow-cyan)/0.05)] shadow-[0_0_8px_hsl(var(--glow-cyan)/0.1)]"
                  : "border-[hsl(var(--glass-border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--glow-cyan)/0.3)]"
              }`}
            >
              <input type="radio" name="reliability" value={o.value} checked={n.reliability === o.value} onChange={() => set("reliability", o.value)} className="sr-only" />
              <span className="font-medium text-sm">{o.label}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{o.desc}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={`flex items-center gap-3 p-3 rounded-lg border transition ${
        n.offline_support
          ? "border-[hsl(var(--glow-cyan)/0.3)] bg-[hsl(var(--glow-cyan)/0.03)] shadow-[0_0_8px_hsl(var(--glow-cyan)/0.06)]"
          : "border-[hsl(var(--glass-border))] bg-[hsl(var(--card))]"
      }`}>
        <label className="text-sm font-medium flex-1">Offline Support Required</label>
        <button
          type="button"
          onClick={() => set("offline_support", !n.offline_support)}
          className={`relative w-11 h-6 rounded-full transition-all ${
            n.offline_support ? "bg-[hsl(var(--glow-cyan))] shadow-[0_0_8px_hsl(var(--glow-cyan)/0.3)]" : "bg-[hsl(var(--glass-border))]"
          }`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${n.offline_support ? "translate-x-5" : ""}`} />
        </button>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-system-label">Compliance Flags</legend>
        <div className="flex flex-wrap gap-2">
          {COMPLIANCE_FLAGS.map((flag) => (
            <label
              key={flag}
              className={`px-3 py-1.5 rounded-md text-sm cursor-pointer border transition ${
                n.compliance.includes(flag)
                  ? "border-[hsl(var(--glow-cyan)/0.5)] bg-[hsl(var(--glow-cyan)/0.08)] text-[hsl(var(--glow-cyan))] shadow-[0_0_6px_hsl(var(--glow-cyan)/0.1)]"
                  : "border-[hsl(var(--glass-border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--glow-cyan)/0.3)]"
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
