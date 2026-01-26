'use client';

import { useState, useMemo } from 'react';
import { X, Minus, Plus, ChevronRight, Check } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useGuestStore } from '@/lib/store';
import { createOrder, sendOrderToN8N } from '@/lib/api';
import { cn } from '@/lib/utils';

interface BBQSet {
  id: string;
  type: 'bbq' | 'fire';
  name: string;
  price: number;
  notice: string;
}

interface BBQOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSet: BBQSet | null;
  token: string;
  onSuccess: () => void;
}

// 배송 시간 옵션 생성 (현재 시간 + 30분부터 30분 단위)
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  const now = new Date();
  const startHour = Math.max(now.getHours() + 1, 17); // 최소 17시부터
  
  for (let hour = startHour; hour <= 21; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 21) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  
  return slots;
}

export function BBQOrderSheet({ 
  open, 
  onOpenChange, 
  selectedSet, 
  token,
  onSuccess 
}: BBQOrderSheetProps) {
  const [quantity, setQuantity] = useState(1);
  const [deliveryTime, setDeliveryTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { addOrder, guestInfo } = useGuestStore();

  const timeSlots = useMemo(() => generateTimeSlots(), []);
  
  // 기본 시간 설정
  useMemo(() => {
    if (timeSlots.length > 0 && !deliveryTime) {
      setDeliveryTime(timeSlots[0]);
    }
  }, [timeSlots, deliveryTime]);

  const totalAmount = selectedSet ? selectedSet.price * quantity : 0;

  const handleSubmit = async () => {
    if (!selectedSet || !deliveryTime) {
      toast({
        title: '배송 시간을 선택해주세요',
        variant: 'destructive',
      });
      return;
    }

    const order = {
      type: selectedSet.type,
      items: [
        {
          id: selectedSet.id,
          name: selectedSet.name,
          quantity,
          price: selectedSet.price,
        },
      ],
      totalAmount,
      deliveryTime,
      notes: notes.trim() || undefined,
    };

    try {
      setIsSubmitting(true);

      // Railway 백엔드에 주문 저장
      await createOrder(token, order);

      // 로컬 스토어에 추가
      addOrder(order);

      // n8n 웹훅으로 알림 전송 (비동기)
      sendOrderToN8N({
        guest: guestInfo.name,
        room: guestInfo.room,
        orderType: order.type,
        items: order.items,
        totalAmount: order.totalAmount,
        deliveryTime: order.deliveryTime,
        notes: order.notes,
      }).catch(console.error);

      toast({
        title: '주문이 접수됐어요',
        description: `${selectedSet.name}이(가) ${deliveryTime}에 배송될 예정이에요.`,
      });

      // 상태 초기화
      setQuantity(1);
      setNotes('');
      onOpenChange(false);
      onSuccess();

    } catch (error) {
      console.error('Order failed:', error);
      toast({
        title: '주문 접수에 실패했어요',
        description: '네트워크 상태를 확인하고 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedSet) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader className="relative">
            <DrawerTitle className="text-lg font-semibold text-center tracking-tight text-brand-dark">
              {selectedSet.name}
            </DrawerTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-brand-cream/50 transition-colors"
              aria-label="닫기"
            >
              <X className="h-5 w-5 text-brand-dark-muted" />
            </button>
          </DrawerHeader>

          <div className="px-5 pb-4 space-y-5">
            {/* 수량 선택 */}
            <div>
              <label className="text-sm font-semibold text-brand-dark mb-3 block">
                수량
              </label>
              <div className="flex items-center justify-center gap-6 py-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-xl border-brand-cream-dark/30"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label="수량 감소"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <span className="text-3xl font-semibold text-brand-dark w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-xl border-brand-cream-dark/30"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="수량 증가"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* 배송 시간 - 2열 그리드 */}
            <div>
              <label className="text-sm font-semibold text-brand-dark mb-3 block">
                배송 시간
              </label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time, index) => {
                  const isSelected = deliveryTime === time;
                  const isFirst = index === 0;
                  return (
                    <button
                      key={time}
                      onClick={() => setDeliveryTime(time)}
                      className={cn(
                        "relative px-3 py-3 rounded-xl text-sm font-medium transition-all border",
                        isSelected
                          ? "bg-brand-dark text-white border-brand-dark"
                          : "bg-brand-cream/30 text-brand-dark-muted border-brand-cream-dark/20 hover:bg-brand-cream/50"
                      )}
                    >
                      {time}
                      {isSelected && (
                        <Check className="absolute top-1.5 right-1.5 h-3 w-3" />
                      )}
                      {isFirst && !isSelected && (
                        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                          빠른
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 요청사항 */}
            <div>
              <label className="text-sm font-semibold text-brand-dark mb-3 block">
                요청사항 <span className="font-normal text-brand-dark-muted">(선택)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="예: 카라반 앞에 놓아주세요"
                className="w-full px-4 py-3 rounded-xl border border-brand-cream-dark/30 bg-background text-sm resize-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                rows={2}
              />
            </div>
          </div>

          <DrawerFooter className="border-t border-brand-cream-dark/20 pt-5 pb-8">
            {/* 총 금액 */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-semibold text-brand-dark-muted">총 금액</span>
              <span className="text-2xl font-bold text-brand-dark">
                ₩{totalAmount.toLocaleString()}
              </span>
            </div>

            {/* CTA 버튼 */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !deliveryTime}
              className="w-full h-14 text-base font-semibold rounded-xl bg-brand-dark hover:bg-brand-dark/90"
            >
              {isSubmitting ? '주문 처리 중...' : (
                <>
                  주문하기
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
