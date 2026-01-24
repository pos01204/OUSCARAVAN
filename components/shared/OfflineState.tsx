import { Card, CardContent } from '@/components/ui/card';

interface OfflineStateProps {
  title?: string;
  description?: string;
}

export function OfflineState({
  title = '인터넷 연결이 필요해요',
  description = '네트워크를 확인한 뒤 다시 시도해주세요.',
}: OfflineStateProps) {
  return (
    <Card variant="muted">
      <CardContent className="py-8 text-center" aria-live="polite">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
