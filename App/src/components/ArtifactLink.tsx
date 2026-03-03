import type { Pointer } from '../lib/types';

interface ArtifactLinkProps {
  pointer: Pointer;
  onClick?: (pointer: Pointer) => void;
}

export default function ArtifactLink({ pointer: _pointer, onClick: _onClick }: ArtifactLinkProps) {
  return <span>ArtifactLink</span>;
}
