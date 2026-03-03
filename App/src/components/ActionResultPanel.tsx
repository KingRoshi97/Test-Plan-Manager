import type { ActionRef, Pointer } from '../lib/types';

interface ActionResultPanelProps {
  action: ActionRef | null;
  artifactPointers?: Pointer[];
  logPointers?: Pointer[];
}

export default function ActionResultPanel({
  action: _action,
  artifactPointers: _artifactPointers,
  logPointers: _logPointers,
}: ActionResultPanelProps) {
  return <div>ActionResultPanel</div>;
}
