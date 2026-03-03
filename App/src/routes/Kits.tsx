import { useParams } from 'react-router-dom';
import DataTable from '../components/DataTable';

export default function Kits() {
  const { runId } = useParams<{ runId: string }>();

  const columns = [
    { key: 'kit_id', header: 'Kit ID', sortable: true },
    { key: 'variant', header: 'Variant', sortable: true },
    { key: 'entrypoint', header: 'Entrypoint' },
    { key: 'bundle', header: 'Bundle' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
          Kits
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
          {runId}
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
          columns={columns}
          data={[]}
          emptyMessage="No kits packed yet — use Pack to generate kits"
        />
      </div>
    </div>
  );
}
