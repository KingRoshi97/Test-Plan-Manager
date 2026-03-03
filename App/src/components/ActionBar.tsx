interface ActionBarProps {
  runId?: string;
  onDoctor: () => void;
  onStartRun: () => void;
  onAdvance: () => void;
  onVerify: () => void;
  onPack: () => void;
  onRepro: () => void;
}

export default function ActionBar({
  runId: _runId,
  onDoctor: _onDoctor,
  onStartRun: _onStartRun,
  onAdvance: _onAdvance,
  onVerify: _onVerify,
  onPack: _onPack,
  onRepro: _onRepro,
}: ActionBarProps) {
  return <div>ActionBar</div>;
}
