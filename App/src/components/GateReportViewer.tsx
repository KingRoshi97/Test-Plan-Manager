import { useState } from 'react';
import type { Pointer } from '../lib/types';
import ArtifactLink from './ArtifactLink';

interface GateReportViewerProps {
  gateReports: Pointer[];
  onSelectEvidence?: (pointer: Pointer) => void;
}

function gateLabel(path: string): string {
  const parts = path.split('/');
  const file = parts[parts.length - 1] ?? path;
  return file.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
}

export default function GateReportViewer({
  gateReports,
  onSelectEvidence,
}: GateReportViewerProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (gateReports.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '13px',
        }}
      >
        No gate reports available
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {gateReports.map((pointer, i) => (
        <div
          key={pointer.path}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        >
          <div
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'var(--bg-card-hover)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'transparent')
            }
          >
            <span
              style={{
                color: 'var(--text-muted)',
                fontSize: '11px',
                transition: 'transform var(--transition-fast)',
                transform: expandedIdx === i ? 'rotate(90deg)' : 'none',
              }}
            >
              ▸
            </span>
            <span style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize' }}>
              {gateLabel(pointer.path)}
            </span>
          </div>

          {expandedIdx === i && (
            <div
              style={{
                padding: '12px 14px 14px',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <ArtifactLink pointer={pointer} onClick={onSelectEvidence} />
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Gate detail will load from Controller
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
