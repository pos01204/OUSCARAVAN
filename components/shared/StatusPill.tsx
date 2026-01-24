import { Badge, type BadgeProps } from '@/components/ui/badge';

interface StatusPillProps {
  label: string;
  className?: string;
  variant?: BadgeProps['variant'];
}

export function StatusPill({ label, className, variant = 'outline' }: StatusPillProps) {
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
