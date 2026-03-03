import { useParams } from 'react-router-dom';
import DataTable from '../components/DataTable';

export default function ProofLedger() {
  const { runId } = useParams<{ runId: string }>();

  const columns = [
    { key: 'proof_id', header: 'Proof ID', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'applies_to', header: 'Applies To' },
    { key: 'source', header: 'Source' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
          Proof Ledger
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
          emptyMessage="No proofs recorded — run Verify to generate proof entries"
        />
      </div>
    </div>
  );
}
