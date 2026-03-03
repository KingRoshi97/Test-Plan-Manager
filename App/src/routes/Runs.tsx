import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { runDetailPath } from '../lib/paths';
import type { RunStatus } from '../lib/types';

interface RunRow {
  run_id: string;
  status: RunStatus;
  created_at: string;
  stages_passed: number;
  gates_passed: number;
  [key: string]: unknown;
}

const SAMPLE_RUNS: RunRow[] = [
  { run_id: 'RUN-000010', status: 'pass', created_at: '2026-03-03T20:41:22Z', stages_passed: 10, gates_passed: 7 },
  { run_id: 'RUN-000009', status: 'pass', created_at: '2026-03-03T20:38:21Z', stages_passed: 10, gates_passed: 7 },
  { run_id: 'RUN-000008', status: 'pass', created_at: '2026-03-03T19:15:00Z', stages_passed: 10, gates_passed: 7 },
];

export default function Runs() {
  const navigate = useNavigate();

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
        Runs
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Pipeline execution history.
      </p>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <DataTable<RunRow>
          columns={[
            { key: 'run_id', header: 'Run ID', width: '160px', render: (row) => (
              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#6366f1' }}>{row.run_id}</span>
            )},
            { key: 'status', header: 'Status', width: '100px', render: (row) => <StatusBadge status={row.status} /> },
            { key: 'stages_passed', header: 'Stages', width: '80px', render: (row) => `${row.stages_passed}/10` },
            { key: 'gates_passed', header: 'Gates', width: '80px', render: (row) => `${row.gates_passed}/7` },
            { key: 'created_at', header: 'Created', render: (row) => new Date(row.created_at).toLocaleString() },
          ]}
          data={SAMPLE_RUNS}
          onRowClick={(row) => navigate(runDetailPath(row.run_id))}
        />
      </div>
    </div>
  );
}
