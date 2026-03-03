interface IdPillProps {
  id: string;
}

export default function IdPill({ id }: IdPillProps) {
  return <span>{id}</span>;
}
