import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = '문제가 발생했어요',
  description = '잠시 후 다시 시도해주세요.',
  onRetry,
  retryLabel = '다시 시도',
}: ErrorStateProps) {
  return (
    <Card>
      <CardContent className="py-8 text-center" aria-live="polite">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
        {onRetry ? (
          <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
