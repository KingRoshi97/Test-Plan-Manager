import { useState } from 'react';
import * as api from '../lib/api';

export default function Commands() {
  const [runId, setRunId] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoadAudit = async () => {
    if (!runId) return;
    setLoading(true);
    try {
      const res = await api.readArtifact(`.axion/runs/${runId}/audit_log.jsonl`);
      setOutput(typeof res.content === 'string' ? res.content : JSON.stringify(res.content, null, 2));
    } catch (e) {
      setOutput(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Commands</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          View audit trail for a pipeline run
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.5px',
              }}
            >
              Run ID
            </label>
            <input
              value={runId}
              onChange={(e) => setRunId(e.target.value)}
              placeholder="RUN-000001"
              style={{ maxWidth: '300px' }}
            />
          </div>
          <button
            onClick={handleLoadAudit}
            disabled={loading || !runId}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-indigo)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              opacity: loading || !runId ? 0.5 : 1,
            }}
          >
            {loading ? 'Loading…' : 'Load Audit Log'}
          </button>
        </div>

        {output && (
          <pre
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              lineHeight: 1.5,
              color: 'var(--text-secondary)',
              overflow: 'auto',
              maxHeight: '500px',
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}
          >
            {output}
          </pre>
        )}
      </div>
    </div>
  );
}
