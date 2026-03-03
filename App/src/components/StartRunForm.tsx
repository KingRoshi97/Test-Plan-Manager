import type { StartRunRequest } from '../lib/types';

interface StartRunFormProps {
  onSubmit: (req: StartRunRequest) => void;
}

export default function StartRunForm({ onSubmit: _onSubmit }: StartRunFormProps) {
  return <div>StartRunForm</div>;
}
