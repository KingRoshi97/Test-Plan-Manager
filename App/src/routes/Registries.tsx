import { useState } from 'react';
import JsonViewer from '../components/JsonViewer';

const REGISTRY_NAMES = ['templates', 'modes', 'profiles', 'gates', 'control-planes'];

export default function Registries() {
  const [selected, setSelected] = useState(REGISTRY_NAMES[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
          Registries
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Explore pipeline registry data
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', minHeight: '400px' }}>
        <div
          style={{
            width: '200px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {REGISTRY_NAMES.map((name) => (
            <button
              key={name}
              onClick={() => setSelected(name)}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 14px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: selected === name ? 600 : 400,
                color: selected === name ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                background: selected === name ? 'var(--accent-indigo-bg)' : 'transparent',
                borderBottom: '1px solid var(--border-light)',
                textTransform: 'capitalize',
                transition: 'background var(--transition-fast)',
              }}
            >
              {name}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          <JsonViewer
            data={{ registry: selected, entries: [], message: 'Registry data will load from Controller' }}
            label={selected}
          />
        </div>
      </div>
    </div>
  );
}
