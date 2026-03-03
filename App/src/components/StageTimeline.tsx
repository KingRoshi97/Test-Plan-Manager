import type { Pointer } from '../lib/types';

interface StageTimelineProps {
  stageReports: Pointer[];
  onSelectStage?: (pointer: Pointer) => void;
}

export default function StageTimeline({
  stageReports: _stageReports,
  onSelectStage: _onSelectStage,
}: StageTimelineProps) {
  return <div>StageTimeline</div>;
}
