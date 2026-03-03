import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GateReportViewer from '../components/GateReportViewer';
import ArtifactDrawer from '../components/ArtifactDrawer';
import type { Pointer } from '../lib/types';
import * as api from '../lib/api';

export default function GateFailures() {
  const { runId } = useParams<{ runId: string }>();
  const [gateReports, setGateReports] = useState<Pointer[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerPointer, setDrawerPointer] = useState<Pointer | null>(null);

  useEffect(() => {
    if (!runId) return;
    api.runDetail(runId)
      .then((res) => setGateReports(res.gate_reports))
      .finally(() => setLoading(false));
  }, [runId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Gate Reports</h1>
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
          opacity: loading ? 0.6 : 1,
        }}
      >
        <GateReportViewer gateReports={gateReports} onSelectEvidence={setDrawerPointer} />
      </div>

      <ArtifactDrawer pointer={drawerPointer} onClose={() => setDrawerPointer(null)} />
    </div>
  );
}
