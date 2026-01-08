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
import { ArrowLeft, Save, Loader2, ExternalLink } from 'lucide-react';
import { formatOptionName, calculateTotalAmount } from '@/lib/utils/reservation';
import { parseAmount, formatAmount } from '@/lib/utils/amount';

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
      
      const isUpdate = reservation?.assignedRoom && reservation.assignedRoom !== sanitizedRoom;
      toast({
        title: '저장 완료',
        description: isUpdate 
          ? '방 배정이 수정되었고 알림톡이 발송되었습니다.'
          : '예약 정보가 저장되었고 알림톡이 발송되었습니다.',
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
              <Label className="text-muted-foreground">체크인</Label>
              <p className="font-medium">{reservation.checkin}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">체크아웃</Label>
              <p className="font-medium">{reservation.checkout}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">상태</Label>
              <div className="mt-1">{getStatusBadge(reservation.status)}</div>
            </div>
          </CardContent>
        </Card>
        
        {/* 상품 및 옵션 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>상품 및 옵션</CardTitle>
            <CardDescription>주문한 상품과 옵션 내역</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ROOM 상품 */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">객실</Label>
              <div className="p-3 bg-muted rounded-md border border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-relaxed break-words">
                      {reservation.roomType}
                    </p>
                    <Badge variant="outline" className="mt-1.5 text-xs">ROOM</Badge>
                  </div>
                  <div className="flex-shrink-0 sm:text-right">
                    <p className="font-semibold text-lg whitespace-nowrap">
                      {(() => {
                        const roomAmount = parseAmount(reservation.amount);
                        if (roomAmount === 0) {
                          return <span className="text-muted-foreground italic text-sm">금액 정보 없음</span>;
                        }
                        return formatAmount(roomAmount, true);
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* OPTION 상품들 */}
            {reservation.options && reservation.options.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">추가 옵션</Label>
                <div className="space-y-2">
                  {reservation.options.map((option, index) => {
                    const formatted = formatOptionName(option.optionName);
                    const hasPrice = option.optionPrice > 0;
                    
                    return (
                      <div key={index} className="p-3 bg-muted rounded-md border border-border/50">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {/* 태그들 (대괄호 내용) */}
                            {formatted.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-1.5">
                                {formatted.tags.map((tag, tagIndex) => (
                                  <Badge 
                                    key={tagIndex} 
                                    variant="outline" 
                                    className="text-xs px-1.5 py-0.5 h-auto font-normal"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {/* 메인 옵션명 */}
                            <p className="font-medium text-sm leading-relaxed break-words">
                              {formatted.mainName || formatted.fullName}
                            </p>
                            
                            {/* OPTION 배지 */}
                            <Badge variant="secondary" className="mt-1.5 text-xs">OPTION</Badge>
                          </div>
                          
                          {/* 가격 */}
                          <div className="flex-shrink-0 sm:text-right">
                            <p className={`font-semibold text-base whitespace-nowrap ${hasPrice ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {hasPrice ? (
                                `${option.optionPrice.toLocaleString()}원`
                              ) : (
                                <span className="italic text-sm">무료</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* 총 결제금액 */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">총 결제금액</Label>
                <p className="text-2xl font-bold text-primary">
                  {calculateTotalAmount(reservation).totalAmount.toLocaleString()}원
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                객실: {calculateTotalAmount(reservation).roomAmount.toLocaleString()}원
                {reservation.options && reservation.options.length > 0 && (
                  <> + 옵션: {calculateTotalAmount(reservation).optionsAmount.toLocaleString()}원</>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* 방 배정 및 연락처 */}
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
                  .sort((a, b) => {
                    // A1~A8, B1~B2 순서로 정렬
                    const aMatch = a.name.match(/^([AB])(\d+)$/);
                    const bMatch = b.name.match(/^([AB])(\d+)$/);
                    if (aMatch && bMatch) {
                      const aLetter = aMatch[1];
                      const bLetter = bMatch[1];
                      const aNum = parseInt(aMatch[2]);
                      const bNum = parseInt(bMatch[2]);
                      if (aLetter !== bLetter) {
                        return aLetter < bLetter ? -1 : 1;
                      }
                      return aNum - bNum;
                    }
                    return a.name.localeCompare(b.name);
                  })
                  .map((room) => (
                    <option key={room.id} value={room.name}>
                      {room.name} ({room.capacity}인실)
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
                <Label className="text-muted-foreground">고객 페이지 링크 (테스트용)</Label>
                <div className="p-2 bg-muted rounded-md space-y-2">
                  <p className="text-sm font-mono break-all">
                    {typeof window !== 'undefined' 
                      ? `${window.location.origin}/guest/${reservation.uniqueToken}`
                      : `/guest/${reservation.uniqueToken}`}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = typeof window !== 'undefined' 
                        ? `${window.location.origin}/guest/${reservation.uniqueToken}`
                        : `/guest/${reservation.uniqueToken}`;
                      window.open(url, '_blank');
                    }}
                    className="w-full"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    새 창에서 열기
                  </Button>
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
