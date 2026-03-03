import { useState } from 'react';

interface JsonViewerProps {
  data: unknown;
  label?: string;
  defaultExpanded?: boolean;
}

function JsonNode({ value, depth = 0 }: { value: unknown; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (value === null) return <span style={{ color: 'var(--text-muted)' }}>null</span>;
  if (value === undefined) return <span style={{ color: 'var(--text-muted)' }}>undefined</span>;
  if (typeof value === 'boolean')
    return <span style={{ color: 'var(--status-gated)' }}>{String(value)}</span>;
  if (typeof value === 'number')
    return <span style={{ color: 'var(--accent-emerald)' }}>{value}</span>;
  if (typeof value === 'string')
    return <span style={{ color: 'var(--status-gated)' }}>"{value}"</span>;

  if (Array.isArray(value)) {
    if (value.length === 0) return <span style={{ color: 'var(--text-muted)' }}>[]</span>;
    return (
      <span>
        <span
          onClick={() => setExpanded(!expanded)}
          style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          {expanded ? '▾' : '▸'} [{value.length}]
        </span>
        {expanded && (
          <div style={{ paddingLeft: 16 }}>
            {value.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>{i}:</span>
                <JsonNode value={item} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span style={{ color: 'var(--text-muted)' }}>{'{}'}</span>;
    return (
      <span>
        <span
          onClick={() => setExpanded(!expanded)}
          style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          {expanded ? '▾' : '▸'} {'{'}
          {entries.length}
          {'}'}
        </span>
        {expanded && (
          <div style={{ paddingLeft: 16 }}>
            {entries.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 4 }}>
                <span style={{ color: 'var(--accent-indigo)' }}>{k}:</span>
                <JsonNode value={v} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  return <span>{String(value)}</span>;
}

export default function JsonViewer({ data, label, defaultExpanded: _de }: JsonViewerProps) {
  return (
    <div
      style={{
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        lineHeight: 1.6,
        overflow: 'auto',
      }}
    >
      {label && (
        <div
          style={{
            color: 'var(--text-muted)',
            fontSize: '11px',
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {label}
        </div>
      )}
      <JsonNode value={data} />
    </div>
  );
}
