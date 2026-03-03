import type { Pointer } from '../lib/types';

interface ArtifactDrawerProps {
  pointer: Pointer | null;
  onClose: () => void;
}

export default function ArtifactDrawer({ pointer: _pointer, onClose: _onClose }: ArtifactDrawerProps) {
  return <div>ArtifactDrawer</div>;
}
