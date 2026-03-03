import type { Pointer } from '../lib/types';

interface StageTimelineProps {
  stageReports: Pointer[];
  onSelectStage?: (pointer: Pointer) => void;
}

function stageLabel(path: string): string {
  const parts = path.split('/');
  const file = parts[parts.length - 1] ?? path;
  return file.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
}

export default function StageTimeline({ stageReports, onSelectStage }: StageTimelineProps) {
  if (stageReports.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '13px',
        }}
      >
        No stages to display
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {stageReports.map((pointer, i) => (
        <div
          key={pointer.path}
          onClick={() => onSelectStage?.(pointer)}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            cursor: onSelectStage ? 'pointer' : 'default',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            transition: 'background var(--transition-fast)',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = 'var(--bg-card-hover)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = 'transparent')
          }
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'var(--accent-indigo)',
                border: '2px solid var(--bg-primary)',
                boxShadow: '0 0 0 2px var(--accent-indigo-bg)',
                flexShrink: 0,
                marginTop: '4px',
              }}
            />
            {i < stageReports.length - 1 && (
              <div
                style={{
                  width: '2px',
                  height: '24px',
                  background: 'var(--border)',
                  marginTop: '4px',
                }}
              />
            )}
          </div>
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                textTransform: 'capitalize',
              }}
            >
              {stageLabel(pointer.path)}
            </div>
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                marginTop: '2px',
              }}
            >
              {pointer.path}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
