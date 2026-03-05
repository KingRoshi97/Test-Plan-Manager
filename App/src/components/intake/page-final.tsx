import { CheckSquare } from "lucide-react";
import type { PageProps } from "./types";

export default function PageFinal({ data, onChange }: PageProps) {
  const f = data.final;
  const set = (field: string, value: unknown) => onChange("final", { [field]: value });

  const allConfirmed = f.confirmed_priorities && f.confirmed_binding && f.confirmed_ready;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-1">Final Verification</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Review your submission and confirm you are ready to proceed.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Definition of Done</label>
        <textarea
          value={f.definition_of_done}
          onChange={(e) => set("definition_of_done", e.target.value)}
          placeholder="What does 'done' look like for this project?"
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Acceptance Criteria</label>
        <textarea
          value={f.acceptance_criteria}
          onChange={(e) => set("acceptance_criteria", e.target.value)}
          placeholder="What must pass for this project to be accepted?"
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
        />
      </div>

      <div className="space-y-3 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">Required Confirmations</p>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition ${
            f.confirmed_priorities
              ? "bg-[hsl(var(--primary))] border-[hsl(var(--primary))]"
              : "border-[hsl(var(--border))] group-hover:border-[hsl(var(--primary)/0.5)]"
          }`}>
            {f.confirmed_priorities && <CheckSquare className="w-4 h-4 text-[hsl(var(--primary-foreground))]" />}
          </div>
          <input type="checkbox" checked={f.confirmed_priorities} onChange={(e) => set("confirmed_priorities", e.target.checked)} className="sr-only" />
          <span className="text-sm">I have reviewed all priorities and constraints</span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition ${
            f.confirmed_binding
              ? "bg-[hsl(var(--primary))] border-[hsl(var(--primary))]"
              : "border-[hsl(var(--border))] group-hover:border-[hsl(var(--primary)/0.5)]"
          }`}>
            {f.confirmed_binding && <CheckSquare className="w-4 h-4 text-[hsl(var(--primary-foreground))]" />}
          </div>
          <input type="checkbox" checked={f.confirmed_binding} onChange={(e) => set("confirmed_binding", e.target.checked)} className="sr-only" />
          <span className="text-sm">I understand this will generate binding project specifications</span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition ${
            f.confirmed_ready
              ? "bg-[hsl(var(--primary))] border-[hsl(var(--primary))]"
              : "border-[hsl(var(--border))] group-hover:border-[hsl(var(--primary)/0.5)]"
          }`}>
            {f.confirmed_ready && <CheckSquare className="w-4 h-4 text-[hsl(var(--primary-foreground))]" />}
          </div>
          <input type="checkbox" checked={f.confirmed_ready} onChange={(e) => set("confirmed_ready", e.target.checked)} className="sr-only" />
          <span className="text-sm">I am ready to submit this intake</span>
        </label>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg border border-[hsl(var(--border))]">
        <label className="text-sm font-medium flex-1">Start pipeline immediately after submission</label>
        <button
          type="button"
          onClick={() => set("start_pipeline", !f.start_pipeline)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            f.start_pipeline ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--border))]"
          }`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${f.start_pipeline ? "translate-x-5" : ""}`} />
        </button>
      </div>

      {!allConfirmed && (
        <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
          All three confirmations above are required before you can submit.
        </p>
      )}
    </div>
  );
}
