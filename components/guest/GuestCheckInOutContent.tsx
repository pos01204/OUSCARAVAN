'use client';

import { useState, useEffect } from 'react';
import { LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useGuestStore } from '@/lib/store';
import { checkIn as apiCheckIn, checkOut as apiCheckOut } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { logError } from '@/lib/logger';
import { extractUserFriendlyMessage } from '@/lib/error-messages';
import { CHECK_IN_OUT } from '@/lib/constants';
import type { Reservation } from '@/lib/api';

interface GuestCheckInOutContentProps {
  reservation: Reservation;
  token: string;
}

export function GuestCheckInOutContent({ reservation, token }: GuestCheckInOutContentProps) {
  const { isCheckedIn, isCheckedOut, checkIn, checkOut } = useGuestStore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checklist, setChecklist] = useState({
    gasLocked: false,
    trashCleaned: false,
  });
  
  useEffect(() => {
    // Railway API에서 체크인/체크아웃 상태 조회 (향후 구현)
    // 현재는 로컬 상태만 사용
  }, []);
  
  const handleCheckIn = async () => {
    setIsProcessing(true);
    
    try {
      // Railway API로 체크인 상태 업데이트
      await apiCheckIn(token);
      
      // 로컬 상태 업데이트
      checkIn();
      
      toast({
        title: '체크인 완료',
        description: '체크인이 완료되었습니다. 즐거운 시간 보내세요!',
      });
    } catch (error) {
      logError('Failed to check in', error, {
        component: 'GuestCheckInOutContent',
        token,
        reservationId: reservation.id,
      });
      // 사용자 친화적인 에러 메시지 추출
      const errorMessage = extractUserFriendlyMessage(error);
      
      toast({
        title: '체크인 실패',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCheckOut = async () => {
    // 체크리스트 확인
    if (!checklist.gasLocked || !checklist.trashCleaned) {
      toast({
        title: '체크리스트 확인 필요',
        description: '모든 체크리스트 항목을 완료해주세요.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Railway API로 체크아웃 상태 업데이트
      await apiCheckOut(token, checklist);
      
      // 로컬 상태 업데이트
      checkOut();
      
      toast({
        title: '체크아웃 완료',
        description: '체크아웃이 완료되었습니다. 안전한 여행 되세요!',
      });
    } catch (error) {
      logError('Failed to check out', error, {
        component: 'GuestCheckInOutContent',
        token,
        reservationId: reservation.id,
        checklist,
      });
      // 사용자 친화적인 에러 메시지 추출
      const errorMessage = extractUserFriendlyMessage(error);
      
      toast({
        title: '체크아웃 실패',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <main className="space-y-6" role="main" aria-label="체크인/체크아웃 페이지">
      <h1 className="text-3xl font-bold">체크인/체크아웃</h1>
      
      {/* 체크인 섹션 */}
      <section aria-label="체크인">
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            체크인
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground mb-1">체크인 시간</p>
            <p className="text-lg font-semibold">{CHECK_IN_OUT.checkIn}</p>
          </div>
          
          {isCheckedIn ? (
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">체크인 완료</span>
            </div>
          ) : (
            <Button
              onClick={handleCheckIn}
              disabled={isProcessing || isCheckedIn}
              className="w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={isCheckedIn ? '체크인 완료' : '체크인하기'}
              aria-disabled={isProcessing || isCheckedIn}
            >
              <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
              {isProcessing ? '처리 중...' : isCheckedIn ? '체크인 완료' : '체크인'}
            </Button>
          )}
        </CardContent>
        </Card>
      </section>
      
      {/* 체크아웃 섹션 */}
      <section aria-label="체크아웃">
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            체크아웃
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground mb-1">체크아웃 시간</p>
            <p className="text-lg font-semibold">{CHECK_IN_OUT.checkOut}</p>
          </div>
          
          {isCheckedOut ? (
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">체크아웃 완료</span>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <p className="text-sm font-medium">체크아웃 체크리스트</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="gasLocked"
                    checked={checklist.gasLocked}
                    onChange={(e) =>
                      setChecklist({ ...checklist, gasLocked: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="가스 밸브 잠금 확인"
                  />
                  <Label htmlFor="gasLocked" className="text-sm">
                    가스 밸브 잠금 확인
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="trashCleaned"
                    checked={checklist.trashCleaned}
                    onChange={(e) =>
                      setChecklist({ ...checklist, trashCleaned: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="쓰레기 정리 확인"
                  />
                  <Label htmlFor="trashCleaned" className="text-sm">
                    쓰레기 정리 완료
                  </Label>
                </div>
              </div>
              
              <Button
                onClick={handleCheckOut}
                disabled={isProcessing || isCheckedOut || !checklist.gasLocked || !checklist.trashCleaned}
                className="w-full focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
                variant="destructive"
                aria-label={isCheckedOut ? '체크아웃 완료' : '체크아웃하기'}
                aria-disabled={isProcessing || isCheckedOut || !checklist.gasLocked || !checklist.trashCleaned}
              >
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                {isProcessing ? '처리 중...' : isCheckedOut ? '체크아웃 완료' : '체크아웃'}
              </Button>
            </>
          )}
        </CardContent>
        </Card>
      </section>
      
      {/* 예약 정보 */}
      <section aria-label="예약 정보">
        <Card>
        <CardHeader>
          <CardTitle>예약 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">체크인</span>
            <span className="text-sm font-medium">{reservation.checkin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">체크아웃</span>
            <span className="text-sm font-medium">{reservation.checkout}</span>
          </div>
          {reservation.assignedRoom && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">배정된 방</span>
              <span className="text-sm font-medium">{reservation.assignedRoom}</span>
            </div>
          )}
        </CardContent>
        </Card>
      </section>
    </main>
  );
}
