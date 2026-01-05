import { adminApi, type Reservation } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminDashboard() {
  // Railway 백엔드 API에서 통계 데이터 조회
  // TODO: Railway 백엔드 API 구현 후 연동
  let stats = {
    todayReservations: 0,
    checkins: 0,
    checkouts: 0,
    orders: 0,
  };
  
  try {
    // stats = await adminApi('/api/admin/stats');
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">
          오우스카라반 예약 관리 시스템
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              오늘 예약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayReservations}</div>
            <p className="text-xs text-muted-foreground">
              오늘 예정된 예약
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              체크인
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkins}</div>
            <p className="text-xs text-muted-foreground">
              오늘 체크인 예정
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              체크아웃
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkouts}</div>
            <p className="text-xs text-muted-foreground">
              오늘 체크아웃 예정
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              주문
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders}</div>
            <p className="text-xs text-muted-foreground">
              처리 대기 중인 주문
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>최근 예약</CardTitle>
          <CardDescription>
            최근 등록된 예약 목록
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Railway 백엔드 API 연동 후 예약 목록이 표시됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
