import { Badge } from '@/components/ui/badge';

interface StatusPillProps {
  label: string;
  className?: string;
}

export function StatusPill({ label, className }: StatusPillProps) {
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
