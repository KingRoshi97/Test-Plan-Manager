import StatusBadge from '../components/StatusBadge';

const STATS = [
  { label: 'Total Templates', value: '446', color: '#6366f1' },
  { label: 'Pipeline Stages', value: '10', color: '#059669' },
  { label: 'Enforced Gates', value: '7', color: '#d97706' },
  { label: 'Knowledge Items', value: '395', color: '#7c3aed' },
];

export default function Dashboard() {
  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
        Dashboard
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>
        Axion pipeline overview and system status.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {STATS.map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: stat.color, marginTop: '4px' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>
          Pipeline Stages
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            'S1_INGEST_NORMALIZE', 'S2_VALIDATE_INTAKE', 'S3_BUILD_CANONICAL',
            'S4_VALIDATE_CANONICAL', 'S5_RESOLVE_STANDARDS', 'S6_SELECT_TEMPLATES',
            'S7_RENDER_DOCS', 'S8_BUILD_PLAN', 'S9_VERIFY_PROOF', 'S10_PACKAGE',
          ].map((stage) => (
            <div
              key={stage}
              style={{
                padding: '8px 12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {stage}
              <StatusBadge status="pass" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
