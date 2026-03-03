import type { Pointer } from '../lib/types';

interface ArtifactLinkProps {
  pointer: Pointer;
  onClick?: (pointer: Pointer) => void;
}

export default function ArtifactLink({ pointer, onClick }: ArtifactLinkProps) {
  const icon = pointer.kind === 'log' ? '📄' : '📦';
  const parts = pointer.path.split('/');
  const shortPath = parts.length > 2
    ? '…/' + parts.slice(-2).join('/')
    : pointer.path;

  return (
    <span
      onClick={() => onClick?.(pointer)}
      title={pointer.path}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color var(--transition-fast)',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.borderColor = 'var(--accent-indigo)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <span style={{ fontSize: '11px' }}>{icon}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
        {shortPath}
      </span>
      <span
        style={{
          fontSize: '9px',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          fontWeight: 600,
          letterSpacing: '0.5px',
        }}
      >
        {pointer.kind}
      </span>
    </span>
  );
}
