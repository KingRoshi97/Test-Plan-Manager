interface JsonViewerProps {
  data: unknown;
  label?: string;
}

export default function JsonViewer({ data: _data, label: _label }: JsonViewerProps) {
  return <div>JsonViewer</div>;
}
