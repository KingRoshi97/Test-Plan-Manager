import type { ActionRef, Pointer } from '../lib/types';
import StatusBadge from './StatusBadge';
import IdPill from './IdPill';
import ArtifactLink from './ArtifactLink';

interface ActionResultPanelProps {
  action: ActionRef | null;
  artifactPointers?: Pointer[];
  logPointers?: Pointer[];
  onPointerClick?: (pointer: Pointer) => void;
}

export default function ActionResultPanel({
  action,
  artifactPointers,
  logPointers,
  onPointerClick,
}: ActionResultPanelProps) {
  if (!action) return null;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <StatusBadge status={action.outcome} />
        <IdPill id={action.action_id} truncate={12} />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {action.action_type}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {action.timestamp}
        </span>
      </div>

      {artifactPointers && artifactPointers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              letterSpacing: '0.5px',
            }}
          >
            Artifacts
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {artifactPointers.map((p) => (
              <ArtifactLink key={p.path} pointer={p} onClick={onPointerClick} />
            ))}
          </div>
        </div>
      )}

      {logPointers && logPointers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              letterSpacing: '0.5px',
            }}
          >
            Logs
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {logPointers.map((p) => (
              <ArtifactLink key={p.path} pointer={p} onClick={onPointerClick} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
