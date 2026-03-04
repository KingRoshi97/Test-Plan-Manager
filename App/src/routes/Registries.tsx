import JsonViewer from '../components/JsonViewer';

const REGISTRIES = [
  { name: 'GATE_REGISTRY', description: '7 enforced gates mapped to pipeline stages', entries: 7 },
  { name: 'CONTROL_PLANE_REGISTRY', description: '3 control planes (ICP, KCP, MCP)', entries: 3 },
  { name: 'OPERATOR_ACTIONS_REGISTRY', description: 'Allowed operator actions per CP', entries: 12 },
  { name: 'FAILURE_CODES_REGISTRY', description: 'Failure codes with remediation templates', entries: 18 },
  { name: 'PROOF_TYPE_REGISTRY', description: 'Proof types for verification', entries: 8 },
  { name: 'FEATURE_REGISTRY', description: 'Feature packs (FEAT-001 through FEAT-017)', entries: 17 },
  { name: 'STAGE_REGISTRY', description: '10 pipeline stages with dependencies', entries: 10 },
  { name: 'TEMPLATE_TYPE_REGISTRY', description: 'Template types across 8 groups', entries: 37 },
  { name: 'STANDARDS_REGISTRY', description: '3 standards packs (eng, sec, qa)', entries: 3 },
];

export default function Registries() {
  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
        Registries
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        System registries governing pipeline behavior.
      </p>

      <div style={{ display: 'grid', gap: '16px' }}>
        {REGISTRIES.map((reg) => (
          <div
            key={reg.name}
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'monospace', color: '#6366f1', margin: 0 }}>
                {reg.name}.json
              </h3>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>{reg.entries} entries</span>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{reg.description}</p>
            <div style={{ marginTop: '12px' }}>
              <JsonViewer
                data={{ name: reg.name, entries: reg.entries, path: `registries/${reg.name}.json` }}
                label={reg.name}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
