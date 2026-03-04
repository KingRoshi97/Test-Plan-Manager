import StatusBadge from '../components/StatusBadge';
import JsonViewer from '../components/JsonViewer';

const SAMPLE_KITS = [
  {
    kit_id: 'KIT-010',
    run_id: 'RUN-000010',
    version: '1.0.0',
    created_at: '2026-03-03T20:41:25Z',
    entry_point: 'kit/bundle/entrypoint.json',
    artifacts: [
      { path: 'kit/bundle/kit_manifest.json', hash: 'sha256:abc123...', size: 2048 },
      { path: 'kit/bundle/entrypoint.json', hash: 'sha256:def456...', size: 512 },
      { path: 'kit/bundle/version_stamp.json', hash: 'sha256:ghi789...', size: 256 },
    ],
  },
  {
    kit_id: 'KIT-009',
    run_id: 'RUN-000009',
    version: '1.0.0',
    created_at: '2026-03-03T20:38:22Z',
    entry_point: 'kit/bundle/entrypoint.json',
    artifacts: [
      { path: 'kit/bundle/kit_manifest.json', hash: 'sha256:jkl012...', size: 2048 },
      { path: 'kit/bundle/entrypoint.json', hash: 'sha256:mno345...', size: 512 },
      { path: 'kit/bundle/version_stamp.json', hash: 'sha256:pqr678...', size: 256 },
    ],
  },
];

export default function Kits() {
  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
        Kits
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Packaged agent kits with embedded KCP enforcer.
      </p>

      <div style={{ display: 'grid', gap: '16px' }}>
        {SAMPLE_KITS.map((kit) => (
          <div
            key={kit.kit_id}
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366f1', fontSize: '16px' }}>
                  {kit.kit_id}
                </span>
                <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '12px' }}>
                  v{kit.version}
                </span>
              </div>
              <StatusBadge status="pass" />
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
              Run: <span style={{ fontFamily: 'monospace' }}>{kit.run_id}</span> — {new Date(kit.created_at).toLocaleString()}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              Entry: <span style={{ fontFamily: 'monospace' }}>{kit.entry_point}</span>
            </div>

            <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px', textTransform: 'uppercase' }}>
              Artifacts ({kit.artifacts.length})
            </h4>
            {kit.artifacts.map((a) => (
              <div
                key={a.path}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '13px',
                }}
              >
                <span style={{ fontFamily: 'monospace', color: '#374151' }}>{a.path}</span>
                <span style={{ color: '#9ca3af' }}>{a.size} bytes</span>
              </div>
            ))}

            <div style={{ marginTop: '16px' }}>
              <JsonViewer data={kit} label={kit.kit_id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
