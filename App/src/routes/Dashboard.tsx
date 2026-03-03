import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActionBar from '../components/ActionBar';
import StatusBadge from '../components/StatusBadge';
import IdPill from '../components/IdPill';
import type { ActionResult } from '../lib/api';
import * as api from '../lib/api';
import { runDetailPath } from '../lib/paths';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ActionResult | null>(null);

  const exec = async (label: string, fn: () => Promise<ActionResult>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setLastResult(result);
    } catch (e) {
      setError(`${label} failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Axion pipeline operator console — initialize, run, and inspect
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-muted)',
            marginBottom: '14px',
          }}
        >
          Pipeline Actions
        </div>
        <ActionBar
          runId={lastResult?.run?.run_id}
          onDoctor={() => exec('Doctor', api.doctor)}
          onStartRun={() => exec('Start Run', api.startRun)}
          onAdvance={() => {
            const rid = lastResult?.run?.run_id;
            if (rid) exec('Advance', () => api.advanceRun(rid));
          }}
          onVerify={() => {}}
          onPack={() => {}}
          onRepro={() => {}}
        />
        {loading && (
          <div style={{ marginTop: '12px', color: 'var(--accent-indigo)', fontSize: '13px' }}>
            Running…
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            background: 'var(--status-fail-bg)',
            border: '1px solid var(--status-fail)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: 'var(--status-fail)',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      {lastResult && (
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
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-muted)',
            }}
          >
            Last Action Result
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <StatusBadge status={lastResult.action.outcome as 'PASS' | 'FAIL' | 'ERROR'} />
            <IdPill id={lastResult.action.action_id} truncate={16} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {lastResult.action.action_type}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              {lastResult.action.timestamp}
            </span>
          </div>

          {lastResult.run && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
              onClick={() => navigate(runDetailPath(lastResult.run!.run_id))}
            >
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Run:</span>
              <IdPill id={lastResult.run.run_id} />
              <StatusBadge status={lastResult.run.status as 'RUNNING'} size="sm" />
              {lastResult.run.current_stage && (
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Stage: {lastResult.run.current_stage}
                </span>
              )}
              <span style={{ fontSize: '11px', color: 'var(--accent-indigo)', marginLeft: 'auto' }}>
                View →
              </span>
            </div>
          )}

          {lastResult.stdout && (
            <div>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                }}
              >
                Output
              </div>
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
                  maxHeight: '300px',
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                }}
              >
                {lastResult.stdout}
              </pre>
            </div>
          )}

          {lastResult.stderr && (
            <div>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'var(--status-error)',
                  marginBottom: '6px',
                }}
              >
                Stderr
              </div>
              <pre
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--status-error)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  lineHeight: 1.5,
                  color: 'var(--status-error)',
                  overflow: 'auto',
                  maxHeight: '200px',
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                }}
              >
                {lastResult.stderr}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
