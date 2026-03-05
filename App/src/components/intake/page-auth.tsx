import type { PageProps } from "./types";

const AUTH_METHODS = [
  { value: "email_password", label: "Email / Password" },
  { value: "oauth", label: "OAuth (Google, GitHub, etc.)" },
  { value: "sso", label: "SSO / SAML" },
  { value: "api_key", label: "API Key" },
  { value: "magic_link", label: "Magic Link" },
];

const AUTH_MODELS = [
  { value: "rbac", label: "RBAC", desc: "Role-Based Access Control" },
  { value: "abac", label: "ABAC", desc: "Attribute-Based Access Control" },
  { value: "custom", label: "Custom", desc: "Custom authorization logic" },
];

export default function PageAuth({ data, onChange }: PageProps) {
  const a = data.auth;
  const set = (field: string, value: unknown) => onChange("auth", { [field]: value });

  const toggleMethod = (method: string) => {
    set("methods", a.methods.includes(method) ? a.methods.filter((m) => m !== method) : [...a.methods, method]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-1">Authentication & Authorization</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Configure how users authenticate and what they can access.
        </p>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <label className="text-sm font-medium flex-1">Does this project require authentication?</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => set("requires_auth", true)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              a.requires_auth
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => set("requires_auth", false)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              !a.requires_auth
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
            }`}
          >
            No
          </button>
        </div>
      </div>

      {!a.requires_auth ? (
        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
          <p className="text-sm">No authentication needed. You can proceed to the next step.</p>
        </div>
      ) : (
        <>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Authentication Methods</legend>
            <div className="flex flex-wrap gap-2">
              {AUTH_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`px-3 py-1.5 rounded-md text-sm cursor-pointer border transition ${
                    a.methods.includes(m.value)
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] text-[hsl(var(--primary))]"
                      : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]"
                  }`}
                >
                  <input type="checkbox" checked={a.methods.includes(m.value)} onChange={() => toggleMethod(m.value)} className="sr-only" />
                  {m.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Account Lifecycle</label>
            <textarea
              value={a.account_lifecycle}
              onChange={(e) => set("account_lifecycle", e.target.value)}
              placeholder="Signup flow, email verification, password reset, account deletion..."
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border border-[hsl(var(--border))]">
            <label className="text-sm font-medium flex-1">Two-Factor Authentication (2FA)</label>
            <button
              type="button"
              onClick={() => set("two_factor", !a.two_factor)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                a.two_factor ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--border))]"
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${a.two_factor ? "translate-x-5" : ""}`} />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Session Rules</label>
            <input
              type="text"
              value={a.session_rules}
              onChange={(e) => set("session_rules", e.target.value)}
              placeholder="e.g. 24h expiry, single-device, remember me option"
              className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Authorization Model</legend>
            <div className="grid grid-cols-3 gap-3">
              {AUTH_MODELS.map((m) => (
                <label
                  key={m.value}
                  className={`flex flex-col p-3 rounded-lg border cursor-pointer transition ${
                    a.authorization_model === m.value
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                      : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="auth_model"
                    value={m.value}
                    checked={a.authorization_model === m.value}
                    onChange={() => set("authorization_model", m.value)}
                    className="sr-only"
                  />
                  <span className="font-medium text-sm">{m.label}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{m.desc}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}
    </div>
  );
}
