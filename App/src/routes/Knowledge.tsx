export default function Knowledge() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
          Knowledge
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Pipeline knowledge base and documentation
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--accent-indigo-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          ◎
        </div>
        <div style={{ fontSize: '15px', fontWeight: 500 }}>Coming Soon</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '360px' }}>
          The Knowledge section will provide searchable pipeline documentation, template references, and KID entries.
        </div>
      </div>
    </div>
  );
}
