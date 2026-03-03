import type { Pointer } from '../lib/types';

interface GateReportViewerProps {
  gateReports: Pointer[];
  onSelectEvidence?: (pointer: Pointer) => void;
}

export default function GateReportViewer({
  gateReports: _gateReports,
  onSelectEvidence: _onSelectEvidence,
}: GateReportViewerProps) {
  return <div>GateReportViewer</div>;
}
