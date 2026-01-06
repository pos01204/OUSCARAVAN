'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getReservation, updateReservation, getRooms, sendReservationAssignedToN8N, type Reservation, type Room } from '@/lib/api';
import { logError } from '@/lib/logger';
import { validatePhone, cleanPhone } from '@/lib/validation';
import { extractUserFriendlyMessage } from '@/lib/error-messages';
import { sanitizeInput } from '@/lib/security';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const reservationId = params.id as string;
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [assignedRoom, setAssignedRoom] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // 예약 정보 및 방 목록 조회
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // 예약 정보 조회
        const reservationData = await getReservation(reservationId);
        setReservation(reservationData);
        setAssignedRoom(reservationData.assignedRoom || '');
        setPhone(reservationData.phone || '');
        
        // 방 목록 조회
        const roomsData = await getRooms();
        setRooms(roomsData);
      } catch (error) {
        logError('Failed to fetch reservation data', error, {
          component: 'ReservationDetailPage',
          reservationId,
        });
        toast({
          title: '오류',
          description: '데이터를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
        router.push('/admin/reservations');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [reservationId, router, toast]);
  
  
  // 저장 처리
  const handleSave = async () => {
    if (!assignedRoom) {
      toast({
        title: '방 배정 필요',
        description: '방을 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!phone) {
      toast({
        title: '전화번호 필요',
        description: '전화번호를 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    
    // 전화번호 형식 검증
    if (!validatePhone(phone)) {
      toast({
        title: '전화번호 형식 오류',
        description: '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // 1. 고유 토큰 생성 (없는 경우)
      const uniqueToken = reservation?.uniqueToken || crypto.randomUUID();
      
      // 2. 전화번호 정리 (하이픈/공백 제거)
      const cleanedPhone = cleanPhone(phone);
      
      // 3. 예약 정보 업데이트 (Railway 백엔드 API 호출)
      // 입력값 정리 (보안)
      const sanitizedRoom = sanitizeInput(assignedRoom, { maxLength: 50 });
      
      const updatedReservation = await updateReservation(reservationId, {
        assignedRoom: sanitizedRoom,
        phone: cleanedPhone,
        uniqueToken,
        status: 'assigned',
      });
      
      setReservation(updatedReservation);
      
      // 4. n8n Webhook 호출 (알림톡 발송 트리거)
      if (reservation?.guestName && reservation?.checkin && reservation?.checkout) {
        try {
          await sendReservationAssignedToN8N({
            reservationId,
            guestName: reservation.guestName,
            phone: cleanedPhone,
            uniqueToken,
            assignedRoom,
            checkin: reservation.checkin,
            checkout: reservation.checkout,
          });
        } catch (webhookError) {
          logError('Failed to call n8n webhook', webhookError, {
            component: 'ReservationDetailPage',
            reservationId,
            action: 'sendReservationAssignedToN8N',
          });
          // Webhook 실패해도 저장은 성공으로 처리
        }
      }
      
      toast({
        title: '저장 완료',
        description: '예약 정보가 저장되었고 알림톡이 발송되었습니다.',
      });
      
      // 예약 목록으로 이동
      router.push('/admin/reservations');
    } catch (error) {
      logError('Failed to save reservation', error, {
        component: 'ReservationDetailPage',
        reservationId,
        action: 'updateReservation',
      });
      // 사용자 친화적인 에러 메시지 추출
      const errorMessage = extractUserFriendlyMessage(error);
      
      toast({
        title: '저장 실패',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!reservation) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">예약 정보를 찾을 수 없습니다.</p>
        <Button onClick={() => router.push('/admin/reservations')} className="mt-4">
          예약 목록으로 돌아가기
        </Button>
      </div>
    );
  }
  
  const getStatusBadge = (status: Reservation['status']) => {
    const variants: Record<Reservation['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: '대기', variant: 'outline' },
      assigned: { label: '배정 완료', variant: 'secondary' },
      checked_in: { label: '체크인', variant: 'default' },
      checked_out: { label: '체크아웃', variant: 'secondary' },
      cancelled: { label: '취소', variant: 'destructive' },
    };
    
    const { label, variant } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/reservations')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">예약 상세</h1>
          <p className="text-muted-foreground">예약 정보 및 방 배정</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* 예약 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>예약 정보</CardTitle>
            <CardDescription>기본 예약 정보</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">예약번호</Label>
              <p className="font-medium">{reservation.reservationNumber}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">예약자명</Label>
              <p className="font-medium">{reservation.guestName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">이메일</Label>
              <p className="font-medium">{reservation.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">예약 상품</Label>
              <p className="font-medium">{reservation.roomType}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">체크인</Label>
              <p className="font-medium">{reservation.checkin}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">체크아웃</Label>
              <p className="font-medium">{reservation.checkout}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">결제금액</Label>
              <p className="font-medium">{reservation.amount}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">상태</Label>
              <div className="mt-1">{getStatusBadge(reservation.status)}</div>
            </div>
          </CardContent>
        </Card>
        
        {/* 방 배정 및 전화번호 */}
        <Card>
          <CardHeader>
            <CardTitle>방 배정 및 연락처</CardTitle>
            <CardDescription>방 배정과 전화번호를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="room">방 배정 *</Label>
              <select
                id="room"
                value={assignedRoom}
                onChange={(e) => setAssignedRoom(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">방을 선택하세요</option>
                {rooms
                  .filter(room => room.status === 'available' || room.id === assignedRoom)
                  .map((room) => (
                    <option key={room.id} value={room.name}>
                      {room.name} ({room.type})
                    </option>
                  ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호 *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                하이픈(-) 없이 입력해도 됩니다.
              </p>
            </div>
            
            {reservation.uniqueToken && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">고객 페이지 링크</Label>
                <div className="p-2 bg-muted rounded-md">
                  <p className="text-sm font-mono break-all">
                    {typeof window !== 'undefined' 
                      ? `${window.location.origin}/guest/${reservation.uniqueToken}`
                      : `/guest/${reservation.uniqueToken}`}
                  </p>
                </div>
              </div>
            )}
            
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  저장 및 알림톡 발송
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
