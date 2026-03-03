import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import IdPill from '../components/IdPill';
import * as api from '../lib/api';
import { runDetailPath } from '../lib/paths';

type RunRow = Record<string, unknown> & {
  run_id: string;
  status: string;
  risk_class?: string;
  current_stage?: string;
  updated_at: string;
};

const COLUMNS = [
  {
    key: 'run_id',
    header: 'Run ID',
    sortable: true,
    render: (row: RunRow) => <IdPill id={row.run_id} />,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (row: RunRow) => <StatusBadge status={row.status as 'RUNNING'} size="sm" />,
  },
  {
    key: 'risk_class',
    header: 'Risk',
    sortable: true,
    render: (row: RunRow) => (
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
        {(row.risk_class as string) ?? '—'}
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
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await api.runsList();
      setRuns((res.runs ?? []) as unknown as RunRow[]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRuns(); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Runs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>All pipeline runs</p>
        </div>
        <button
          onClick={fetchRuns}
          style={{
            padding: '7px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--status-fail-bg)',
            border: '1px solid var(--status-fail)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: 'var(--status-fail)',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <DataTable
          columns={COLUMNS}
          data={runs}
          onRowClick={(row) => navigate(runDetailPath(row.run_id))}
          emptyMessage={loading ? 'Loading runs…' : 'No runs yet — start a run from the Dashboard'}
        />
      </div>
    </div>
  );
}
