import { useState } from 'react';
import ActionBar from '../components/ActionBar';
import StatusBadge from '../components/StatusBadge';
import StartRunForm from '../components/StartRunForm';

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          System overview and quick actions
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
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
              marginBottom: '12px',
            }}
          >
            System Health
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <StatusBadge status="PASS" />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Last doctor check
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            No checks run yet — run Doctor to verify
          </div>
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
              marginBottom: '12px',
            }}
          >
            Latest Run
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            No runs started — use Start Run to begin
          </div>
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
              marginBottom: '12px',
            }}
          >
            Recent Actions
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            No actions recorded yet
          </div>
        </div>
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
          Quick Actions
        </div>
        <ActionBar
          onDoctor={() => {}}
          onStartRun={() => setShowForm(true)}
          onAdvance={() => {}}
          onVerify={() => {}}
          onPack={() => {}}
          onRepro={() => {}}
        />
      </div>

      {showForm && (
        <StartRunForm
          onSubmit={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
