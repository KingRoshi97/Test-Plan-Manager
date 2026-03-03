import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StageTimeline from '../components/StageTimeline';
import GateReportViewer from '../components/GateReportViewer';
import ActionBar from '../components/ActionBar';
import ArtifactDrawer from '../components/ArtifactDrawer';
import type { Pointer } from '../lib/types';
import { gateFailuresPath, verifyPath, kitsPath, proofsPath } from '../lib/paths';

type Tab = 'overview' | 'artifacts' | 'gates' | 'logs';

export default function RunDetail() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [drawerPointer, setDrawerPointer] = useState<Pointer | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'artifacts', label: 'Artifacts' },
    { key: 'gates', label: 'Gates' },
    { key: 'logs', label: 'Logs' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
            Run Detail
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
            {runId}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(gateFailuresPath(runId!))}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            Gates
          </button>
          <button
            onClick={() => navigate(verifyPath(runId!))}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            Verify
          </button>
          <button
            onClick={() => navigate(kitsPath(runId!))}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            Kits
          </button>
          <button
            onClick={() => navigate(proofsPath(runId!))}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            Proofs
          </button>
        </div>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
        }}
      >
        <ActionBar
          runId={runId}
          onDoctor={() => {}}
          onStartRun={() => {}}
          onAdvance={() => {}}
          onVerify={() => {}}
          onPack={() => {}}
          onRepro={() => {}}
        />
      </div>

      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 500,
              color: activeTab === t.key ? 'var(--accent-indigo)' : 'var(--text-muted)',
              borderBottom: activeTab === t.key ? '2px solid var(--accent-indigo)' : '2px solid transparent',
              transition: 'color var(--transition-fast)',
            }}
          >
            {t.label}
          </button>
        ))}
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
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>Stage Timeline</div>
            <StageTimeline stageReports={[]} onSelectStage={setDrawerPointer} />
          </div>
        )}
        {activeTab === 'gates' && (
          <GateReportViewer gateReports={[]} onSelectEvidence={setDrawerPointer} />
        )}
        {activeTab === 'artifacts' && (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '24px', textAlign: 'center' }}>
            Artifacts will appear after stages complete
          </div>
        )}
        {activeTab === 'logs' && (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '24px', textAlign: 'center' }}>
            Logs will appear after stages complete
          </div>
        )}
      </div>

      <ArtifactDrawer pointer={drawerPointer} onClose={() => setDrawerPointer(null)} />
    </div>
  );
}
