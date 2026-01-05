import { adminLogin } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; redirect?: string };
}) {
  const hasError = searchParams?.error === 'invalid_credentials';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">관리자 로그인</CardTitle>
          <CardDescription>
            관리자 계정으로 로그인하여 예약 시스템에 접근하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={adminLogin} className="grid gap-4">
            {hasError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                아이디 또는 비밀번호가 올바르지 않습니다.
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="id">아이디</Label>
              <Input 
                id="id" 
                name="id" 
                type="text" 
                placeholder="ouscaravan" 
                required 
                autoComplete="username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full">
              로그인
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
