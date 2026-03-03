import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StageTimeline from '../components/StageTimeline';
import GateReportViewer from '../components/GateReportViewer';
import ArtifactDrawer from '../components/ArtifactDrawer';
import LogDrawer from '../components/LogDrawer';
import StatusBadge from '../components/StatusBadge';
import IdPill from '../components/IdPill';
import ArtifactLink from '../components/ArtifactLink';
import type { Pointer, RunDetailResponse } from '../lib/types';
import type { ActionResult } from '../lib/api';
import * as api from '../lib/api';

type Tab = 'overview' | 'artifacts' | 'gates' | 'logs';

const STAGE_ORDER = [
  'S1_INGEST_NORMALIZE',
  'S2_VALIDATE_INTAKE',
  'S3_BUILD_CANONICAL',
  'S4_VALIDATE_CANONICAL',
  'S5_RESOLVE_STANDARDS',
  'S6_SELECT_TEMPLATES',
  'S7_RENDER_DOCS',
  'S8_BUILD_PLAN',
  'S9_VERIFY_PROOF',
  'S10_PACKAGE',
];

export default function RunDetail() {
  const { runId } = useParams<{ runId: string }>();
  const [detail, setDetail] = useState<RunDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [drawerPointer, setDrawerPointer] = useState<Pointer | null>(null);
  const [drawerType, setDrawerType] = useState<'artifact' | 'log'>('artifact');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionOutput, setActionOutput] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const fetchDetail = async () => {
    if (!runId) return;
    setLoading(true);
    try {
      const res = await api.runDetail(runId);
      setDetail(res);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [runId]);

  const openPointer = (pointer: Pointer) => {
    setDrawerType(pointer.kind === 'log' ? 'log' : 'artifact');
    setDrawerPointer(pointer);
  };

  const handleRunStage = async (stageId: string) => {
    if (!runId) return;
    setActionLoading(true);
    setActionOutput(null);
    try {
      const res = await api.runStage(runId, stageId);
      setActionOutput(`Stage ${stageId}: ${res.action.outcome}\n\n${res.stdout}`);
      fetchDetail();
    } catch (e) {
      setActionOutput(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdvance = async () => {
    if (!runId) return;
    setActionLoading(true);
    setActionOutput(null);
    try {
      const res = await api.advanceRun(runId);
      const advancedStage = (res as ActionResult & { advanced_stage?: string }).advanced_stage;
      const label = advancedStage ? `Advanced ${advancedStage}` : 'Advance';
      setActionOutput(`${label}: ${res.action.outcome}\n\n${res.stdout}`);
      fetchDetail();
    } catch (e) {
      setActionOutput(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setActionLoading(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'artifacts', label: `Artifacts (${detail?.stage_reports.length ?? 0})` },
    { key: 'gates', label: `Gates (${detail?.gate_reports.length ?? 0})` },
    { key: 'logs', label: 'Stage Runner' },
  ];

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading run {runId}…
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: 'var(--status-fail-bg)',
          border: '1px solid var(--status-fail)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          color: 'var(--status-fail)',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Run</h1>
            {detail?.run && <IdPill id={detail.run.run_id} />}
            {detail?.run && <StatusBadge status={detail.run.status} />}
          </div>
          {detail?.run.current_stage && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Current stage: {detail.run.current_stage}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={fetchDetail}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            Refresh
          </button>
          <button
            onClick={handleAdvance}
            disabled={actionLoading}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-indigo)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              opacity: actionLoading ? 0.6 : 1,
            }}
          >
            {actionLoading ? 'Running…' : 'Advance Next Stage'}
          </button>
        </div>
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
            <StageTimeline
              stageReports={detail?.stage_reports ?? []}
              onSelectStage={openPointer}
            />
            {detail?.manifest && (
              <div style={{ marginTop: '8px' }}>
                <ArtifactLink pointer={detail.manifest} onClick={openPointer} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'artifacts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              Stage Reports & Artifacts
            </div>
            {(detail?.stage_reports ?? []).length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                No artifacts yet — run stages to generate
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {detail?.stage_reports.map((p) => (
                  <ArtifactLink key={p.path} pointer={p} onClick={openPointer} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'gates' && (
          <GateReportViewer
            gateReports={detail?.gate_reports ?? []}
            onSelectEvidence={openPointer}
          />
        )}

        {activeTab === 'logs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>Run Individual Stage</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {STAGE_ORDER.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStage(s)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: selectedStage === s ? 'var(--accent-indigo-bg)' : 'var(--bg-secondary)',
                    border: selectedStage === s ? '1px solid var(--accent-indigo)' : '1px solid var(--border)',
                    color: selectedStage === s ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            {selectedStage && (
              <button
                onClick={() => handleRunStage(selectedStage)}
                disabled={actionLoading}
                style={{
                  alignSelf: 'flex-start',
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-indigo)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  opacity: actionLoading ? 0.6 : 1,
                }}
              >
                {actionLoading ? 'Running…' : `Run ${selectedStage}`}
              </button>
            )}
            {actionOutput && (
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
                  maxHeight: '400px',
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                }}
              >
                {actionOutput}
              </pre>
            )}
          </div>
        )}
      </div>

      {drawerType === 'artifact' ? (
        <ArtifactDrawer pointer={drawerPointer} onClose={() => setDrawerPointer(null)} />
      ) : (
        <LogDrawer pointer={drawerPointer} onClose={() => setDrawerPointer(null)} />
      )}
    </div>
  );
}
