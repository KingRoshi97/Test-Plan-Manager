import { useState } from 'react';
import { useParams } from 'react-router-dom';
import GateReportViewer from '../components/GateReportViewer';
import ArtifactDrawer from '../components/ArtifactDrawer';
import type { Pointer } from '../lib/types';

export default function GateFailures() {
  const { runId } = useParams<{ runId: string }>();
  const [drawerPointer, setDrawerPointer] = useState<Pointer | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
          Gate Failures
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
          minHeight: '200px',
        }}
      >
        <GateReportViewer
          gateReports={[]}
          onSelectEvidence={setDrawerPointer}
        />
      </div>

      <ArtifactDrawer pointer={drawerPointer} onClose={() => setDrawerPointer(null)} />
    </div>
  );
}
