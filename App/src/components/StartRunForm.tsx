import { useState } from 'react';
import type { StartRunRequest, RiskClass, ExecutorType } from '../lib/types';

interface StartRunFormProps {
  onSubmit: (req: StartRunRequest) => void;
  onCancel?: () => void;
}

export default function StartRunForm({ onSubmit, onCancel }: StartRunFormProps) {
  const [riskClass, setRiskClass] = useState<RiskClass>('prototype');
  const [executorType, setExecutorType] = useState<ExecutorType>('internal');
  const [modeId, setModeId] = useState('');
  const [profileId, setProfileId] = useState('');
  const [platforms, setPlatforms] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      risk_class: riskClass,
      executor_type_default: executorType,
      mode_id: modeId || undefined,
      run_profile_id: profileId || undefined,
      targets: {
        platforms: platforms
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      },
    });
  };

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
      }}
    >
      <div style={{ fontSize: '14px', fontWeight: 600 }}>Start New Run</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Risk Class</label>
          <select
            value={riskClass}
            onChange={(e) => setRiskClass(e.target.value as RiskClass)}
          >
            <option value="prototype">Prototype</option>
            <option value="production">Production</option>
            <option value="compliance">Compliance</option>
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Executor Type</label>
          <select
            value={executorType}
            onChange={(e) => setExecutorType(e.target.value as ExecutorType)}
          >
            <option value="internal">Internal</option>
            <option value="external">External</option>
          </select>
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Mode ID</label>
        <input
          value={modeId}
          onChange={(e) => setModeId(e.target.value)}
          placeholder="Optional"
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Run Profile ID</label>
        <input
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
          placeholder="Optional"
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Platforms (comma-separated)</label>
        <input
          value={platforms}
          onChange={(e) => setPlatforms(e.target.value)}
          placeholder="e.g. web, ios, android"
          required
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '13px',
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
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
          Start Run
        </button>
      </div>
    </form>
  );
}
