import type { OutcomeStatus, RunStatus, StageStatus } from '../lib/types';

interface StatusBadgeProps {
  status: OutcomeStatus | RunStatus | StageStatus;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PASS: { bg: 'var(--status-pass-bg)', color: 'var(--status-pass)' },
  RELEASED: { bg: 'var(--status-pass-bg)', color: 'var(--status-pass)' },
  FAIL: { bg: 'var(--status-fail-bg)', color: 'var(--status-fail)' },
  FAILED: { bg: 'var(--status-fail-bg)', color: 'var(--status-fail)' },
  ERROR: { bg: 'var(--status-error-bg)', color: 'var(--status-error)' },
  RUNNING: { bg: 'var(--status-running-bg)', color: 'var(--status-running)' },
  IN_PROGRESS: { bg: 'var(--status-running-bg)', color: 'var(--status-running)' },
  GATED: { bg: 'var(--status-gated-bg)', color: 'var(--status-gated)' },
  PAUSED: { bg: 'var(--status-gated-bg)', color: 'var(--status-gated)' },
  SKIP: { bg: 'var(--status-gated-bg)', color: 'var(--status-gated)' },
  QUEUED: { bg: 'var(--status-pending-bg)', color: 'var(--status-pending)' },
  NOT_STARTED: { bg: 'var(--status-pending-bg)', color: 'var(--status-pending)' },
  ARCHIVED: { bg: 'var(--status-pending-bg)', color: 'var(--status-pending)' },
  CANCELLED: { bg: 'var(--status-pending-bg)', color: 'var(--status-pending)' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.QUEUED;
  const px = size === 'sm' ? '6px 8px' : '4px 10px';
  const fs = size === 'sm' ? '10px' : '11px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: px,
        borderRadius: 'var(--radius-full)',
        background: s.bg,
        color: s.color,
        fontSize: fs,
        fontWeight: 600,
        letterSpacing: '0.5px',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
