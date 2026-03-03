import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import IdPill from '../components/IdPill';
import type { RunSummary } from '../lib/types';
import { runDetailPath } from '../lib/paths';

type RunRow = RunSummary & Record<string, unknown>;

const COLUMNS = [
  {
    key: 'run_id',
    header: 'Run ID',
    sortable: true,
    render: (row: RunRow) => <IdPill id={row.run_id} truncate={10} />,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (row: RunRow) => <StatusBadge status={row.status} size="sm" />,
  },
  {
    key: 'risk_class',
    header: 'Risk',
    sortable: true,
    render: (row: RunRow) => (
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' as const }}>
        {row.risk_class ?? '—'}
      </span>
    ),
  },
  {
    key: 'current_stage',
    header: 'Stage',
    render: (row: RunRow) => (
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        {row.current_stage ?? '—'}
      </span>
    ),
  },
  {
    key: 'updated_at',
    header: 'Updated',
    sortable: true,
  },
];

export default function Runs() {
  const navigate = useNavigate();
  const runs: RunRow[] = [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
          Runs
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          All pipeline runs
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        <DataTable
          columns={COLUMNS}
          data={runs}
          onRowClick={(row) => navigate(runDetailPath(row.run_id))}
          emptyMessage="No runs yet — start a run from the Dashboard"
        />
      </div>
    </div>
  );
}
