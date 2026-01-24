import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'compact';
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const content = (
    <CardContent
      className={cn(
        variant === 'compact' ? 'py-4 text-center' : 'py-8 text-center',
        className
      )}
      aria-live="polite"
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </CardContent>
  );

  if (variant === 'compact') {
    return <Card variant="muted">{content}</Card>;
  }

  return <Card>{content}</Card>;
}
