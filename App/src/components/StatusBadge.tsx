import type { RunStatus, StageStatus, GateStatus } from '../lib/types';

type BadgeStatus = RunStatus | StageStatus | GateStatus;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pass: { bg: '#dcfce7', text: '#166534' },
  fail: { bg: '#fee2e2', text: '#991b1b' },
  running: { bg: '#dbeafe', text: '#1e40af' },
  pending: { bg: '#f3f4f6', text: '#6b7280' },
  skip: { bg: '#fef3c7', text: '#92400e' },
  not_started: { bg: '#f3f4f6', text: '#6b7280' },
  in_progress: { bg: '#dbeafe', text: '#1e40af' },
};

interface StatusBadgeProps {
  status: BadgeStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
