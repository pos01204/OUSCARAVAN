import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type LoadingVariant = 'default' | 'info' | 'cta' | 'alert' | 'muted';

interface LoadingStateProps {
  title?: string;
  rows?: number;
  variant?: LoadingVariant;
}

const DEFAULT_ROW_WIDTHS = ['w-36', 'w-10/12', 'w-8/12'];

export function LoadingState({ title, rows = 3, variant = 'muted' }: LoadingStateProps) {
  const widths = DEFAULT_ROW_WIDTHS;

  return (
    <Card variant={variant}>
      {title ? (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton
            key={index}
            className={`h-4 ${widths[index % widths.length]}`}
          />
        ))}
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}
