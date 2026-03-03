import StatusBadge from '../components/StatusBadge';
import JsonViewer from '../components/JsonViewer';

const PROOF_TYPES = [
  'verification_log',
  'snapshot_hash',
  'command_output',
  'gate_report',
  'audit_entry',
  'determinism_hash',
  'coverage_report',
  'bundle_manifest',
];

const SAMPLE_PROOFS = [
  {
    proof_id: 'PRF-001',
    proof_type: 'gate_report',
    run_id: 'RUN-000010',
    stage_id: 'S2_VALIDATE_INTAKE',
    created_at: '2026-03-03T20:41:22Z',
    payload: { gate_id: 'G1_INTAKE_VALIDITY', status: 'pass', checks: 3 },
  },
  {
    proof_id: 'PRF-002',
    proof_type: 'snapshot_hash',
    run_id: 'RUN-000010',
    stage_id: 'S5_RESOLVE_STANDARDS',
    created_at: '2026-03-03T20:41:23Z',
    payload: { hash: 'sha256:a1b2c3d4...', artifact: 'resolved_standards_snapshot.json' },
  },
  {
    proof_id: 'PRF-003',
    proof_type: 'bundle_manifest',
    run_id: 'RUN-000010',
    stage_id: 'S10_PACKAGE',
    created_at: '2026-03-03T20:41:25Z',
    payload: { kit_id: 'KIT-010', artifacts: 8, verified: true },
  },
];

export default function Proofs() {
  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
        Proofs
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Proof ledger — cryptographic evidence of pipeline execution.
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {PROOF_TYPES.map((type) => (
          <span
            key={type}
            style={{
              padding: '4px 12px',
              backgroundColor: '#eef2ff',
              color: '#4338ca',
              borderRadius: '9999px',
              fontSize: '12px',
              fontFamily: 'monospace',
            }}
          >
            {type}
          </span>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {SAMPLE_PROOFS.map((proof) => (
          <div
            key={proof.proof_id}
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#6366f1', marginRight: '12px' }}>
                  {proof.proof_id}
                </span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{proof.proof_type}</span>
              </div>
              <StatusBadge status="pass" />
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
              {proof.run_id} / {proof.stage_id} — {new Date(proof.created_at).toLocaleString()}
            </div>
            <JsonViewer data={proof.payload} label="payload" />
          </div>
        ))}
      </div>
    </div>
  );
}
