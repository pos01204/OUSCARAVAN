import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 font-heading text-6xl font-bold text-primary">404</h1>
        <h2 className="mb-2 text-2xl font-semibold">페이지를 찾을 수 없습니다</h2>
        <p className="mb-8 text-muted-foreground">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link href="/login">
          <Button size="lg" className="gap-2">
            <Home className="h-4 w-4" />
            로그인으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}
