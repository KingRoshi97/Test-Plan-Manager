import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ArtifactDrawer from '../components/ArtifactDrawer';
import type { Pointer } from '../lib/types';

export default function Verify() {
  const { runId } = useParams<{ runId: string }>();
  const [drawerPointer, setDrawerPointer] = useState<Pointer | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
          Verify
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
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>Verification</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Run verification checks against this pipeline run
            </div>
          </div>
          <button
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-indigo)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
            }}
          >
            Run Verify
          </button>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '16px',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
            }}
          >
            Results
          </div>
          No verification results yet
        </div>
      </div>

      <ArtifactDrawer pointer={drawerPointer} onClose={() => setDrawerPointer(null)} />
    </div>
  );
}
