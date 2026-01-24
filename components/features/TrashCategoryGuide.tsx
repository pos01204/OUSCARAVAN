'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TrashCategory } from '@/types';

interface TrashCategoryGuideProps {
  categories: TrashCategory[];
}

export function TrashCategoryGuide({ categories }: TrashCategoryGuideProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4" role="region" aria-label="쓰레기 종류별 분류 가이드">
      {categories.map((category) => (
        <Card key={category.id} variant="info">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="text-lg font-bold mb-1">{category.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground mb-2">주요 예시:</p>
              <div className="flex flex-wrap gap-2">
                {category.examples.map((example, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {example}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
