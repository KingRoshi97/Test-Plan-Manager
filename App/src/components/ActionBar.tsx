interface ActionBarProps {
  runId?: string;
  onDoctor: () => void;
  onStartRun: () => void;
  onAdvance: () => void;
  onVerify: () => void;
  onPack: () => void;
  onRepro: () => void;
}

interface ActionDef {
  label: string;
  icon: string;
  handler: keyof ActionBarProps;
  needsRun?: boolean;
  accent?: boolean;
}

const ACTIONS: ActionDef[] = [
  { label: 'Doctor', icon: '⚕', handler: 'onDoctor' },
  { label: 'Start Run', icon: '▶', handler: 'onStartRun', accent: true },
  { label: 'Advance', icon: '⏭', handler: 'onAdvance', needsRun: true },
  { label: 'Verify', icon: '✓', handler: 'onVerify', needsRun: true },
  { label: 'Pack', icon: '📦', handler: 'onPack', needsRun: true },
  { label: 'Repro', icon: '🔄', handler: 'onRepro', needsRun: true },
];

export default function ActionBar({
  runId,
  onDoctor,
  onStartRun,
  onAdvance,
  onVerify,
  onPack,
  onRepro,
}: ActionBarProps) {
  const handlers: Record<string, () => void> = {
    onDoctor,
    onStartRun,
    onAdvance,
    onVerify,
    onPack,
    onRepro,
  };

  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {ACTIONS.map((a) => {
        const disabled = a.needsRun && !runId;
        return (
          <button
            key={a.label}
            onClick={() => !disabled && handlers[a.handler]?.()}
            disabled={disabled}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: 'var(--radius-md)',
              background: a.accent
                ? 'var(--accent-indigo)'
                : 'var(--bg-card)',
              color: disabled
                ? 'var(--text-muted)'
                : a.accent
                  ? '#fff'
                  : 'var(--text-primary)',
              border: a.accent ? 'none' : '1px solid var(--border)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'background var(--transition-fast)',
            }}
          >
            <span style={{ fontSize: '13px' }}>{a.icon}</span>
            {a.label}
          </button>
        );
      })}
    </div>
  );
}
