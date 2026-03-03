import type { OutcomeStatus, RunStatus, StageStatus } from '../lib/types';

interface StatusBadgeProps {
  status: OutcomeStatus | RunStatus | StageStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <span>{status}</span>;
}
