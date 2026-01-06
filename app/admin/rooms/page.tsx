'use client';

import { useState, useEffect } from 'react';
import { getRooms, type Room } from '@/lib/api';
import { logError } from '@/lib/logger';
import { extractUserFriendlyMessage } from '@/lib/error-messages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface RoomWithReservation extends Room {
  reservation?: {
    id: string;
    guestName: string;
    checkin: string;
    checkout: string;
    status: string;
  } | null;
}

export default function RoomsPage() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<RoomWithReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const data = await getRooms();
      // 배열로 받거나, rooms 속성에서 가져오기
      const roomsArray = Array.isArray(data) ? data : (data.rooms || []);
      setRooms(roomsArray);
    } catch (error) {
      logError('Failed to fetch rooms', error, {
        component: 'RoomsPage',
      });
      
      // 401 에러인 경우 로그인 페이지로 리다이렉트
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        // 쿠키 삭제
        document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login';
        return;
      }
      
      toast({
        title: '오류',
        description: extractUserFriendlyMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 방 목록 조회
  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const getStatusBadge = (status: Room['status']) => {
    const variants: Record<Room['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      available: { label: '사용 가능', variant: 'default' },
      occupied: { label: '사용 중', variant: 'secondary' },
      maintenance: { label: '점검 중', variant: 'destructive' },
    };
    
    const { label, variant } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">방 관리</h1>
          <p className="text-muted-foreground">
            기본 10개 방 목록 (오션뷰 전용)
          </p>
        </div>
      </div>
      
      {rooms.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              방 데이터를 불러오는 중...
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms
            .sort((a, b) => {
              // 숫자로 정렬 (1호, 2호, ... 10호)
              const numA = parseInt(a.name) || 999;
              const numB = parseInt(b.name) || 999;
              return numA - numB;
            })
            .map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{room.name}호</CardTitle>
                  {getStatusBadge(room.status)}
                </div>
                <CardDescription>{room.capacity}인실</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">배정 정보</p>
                    {room.reservation ? (
                      <div className="mt-1">
                        <p className="font-medium">{room.reservation.guestName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(room.reservation.checkin).toLocaleDateString('ko-KR')} ~ {new Date(room.reservation.checkout).toLocaleDateString('ko-KR')}
                        </p>
                        <Badge 
                          variant={
                            room.reservation.status === 'checked_in' ? 'default' :
                            room.reservation.status === 'checked_out' ? 'secondary' :
                            'outline'
                          }
                          className="mt-1"
                        >
                          {room.reservation.status === 'checked_in' ? '체크인' :
                           room.reservation.status === 'checked_out' ? '체크아웃' :
                           '배정 완료'}
                        </Badge>
                      </div>
                    ) : (
                      <p className="font-medium text-muted-foreground">미배정</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
    </div>
  );
}
