import { useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import JsonViewer from '../components/JsonViewer';

const STAGES = [
  { id: 'S1_INGEST_NORMALIZE', status: 'pass' as const, gate: null },
  { id: 'S2_VALIDATE_INTAKE', status: 'pass' as const, gate: 'G1_INTAKE_VALIDITY' },
  { id: 'S3_BUILD_CANONICAL', status: 'pass' as const, gate: null },
  { id: 'S4_VALIDATE_CANONICAL', status: 'pass' as const, gate: 'G2_CANONICAL_INTEGRITY' },
  { id: 'S5_RESOLVE_STANDARDS', status: 'pass' as const, gate: 'G3_STANDARDS_RESOLVED' },
  { id: 'S6_SELECT_TEMPLATES', status: 'pass' as const, gate: 'G4_TEMPLATE_SELECTION' },
  { id: 'S7_RENDER_DOCS', status: 'pass' as const, gate: 'G5_TEMPLATE_COMPLETENESS' },
  { id: 'S8_BUILD_PLAN', status: 'pass' as const, gate: 'G6_PLAN_COVERAGE' },
  { id: 'S9_VERIFY_PROOF', status: 'pass' as const, gate: null },
  { id: 'S10_PACKAGE', status: 'pass' as const, gate: 'G8_PACKAGE_INTEGRITY' },
];

const SAMPLE_MANIFEST = {
  run_id: 'RUN-000010',
  pipeline: 'mechanics_v1',
  stage_order: STAGES.map((s) => s.id),
  gates_required: ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G8'],
};

export default function RunDetail() {
  const { runId } = useParams<{ runId: string }>();

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
        <span style={{ fontFamily: 'monospace', color: '#6366f1' }}>{runId}</span>
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Run detail view — stages, gates, and artifacts.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>
            Stages
          </h3>
          {STAGES.map((stage) => (
            <div
              key={stage.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#374151' }}>
                {stage.id}
              </span>
              <StatusBadge status={stage.status} />
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>
            Gates
          </h3>
          {STAGES.filter((s) => s.gate).map((stage) => (
            <div
              key={stage.gate}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#374151' }}>
                {stage.gate}
              </span>
              <StatusBadge status="pass" />
            </div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
          Run Manifest
        </h3>
        <JsonViewer data={SAMPLE_MANIFEST} defaultExpanded />
      </div>
    </div>
  );
}
