import { Card, CardContent } from '@/components/ui/card';

interface PermissionStateProps {
  title?: string;
  description?: string;
}

export function PermissionState({
  title = '접근 권한이 필요해요',
  description = '권한을 확인한 뒤 다시 시도해주세요.',
}: PermissionStateProps) {
  return (
    <Card variant="muted">
      <CardContent className="py-8 text-center" aria-live="polite">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
