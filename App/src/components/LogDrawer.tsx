import type { Pointer } from '../lib/types';

interface LogDrawerProps {
  pointer: Pointer | null;
  onClose: () => void;
}

export default function LogDrawer({ pointer: _pointer, onClose: _onClose }: LogDrawerProps) {
  return <div>LogDrawer</div>;
}
