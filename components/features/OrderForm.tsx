'use client';

import { useState } from 'react';
import { Minus, Plus, CheckCircle2 } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BBQ_SETS } from '@/lib/constants';
import { useGuestStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { sendOrderToN8N, createOrder } from '@/lib/api';

interface OrderFormProps {
  onClose: () => void;
  token: string;
  initial?: {
    selectedSetId?: string | null;
    quantity?: number;
    deliveryTime?: string;
    notes?: string;
    step?: OrderStep;
  };
}

type OrderStep = 'select' | 'quantity' | 'time' | 'review';

export function OrderForm({ onClose, token, initial }: OrderFormProps) {
  const [selectedSet, setSelectedSet] = useState<string | null>(initial?.selectedSetId ?? null);
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [deliveryTime, setDeliveryTime] = useState(initial?.deliveryTime ?? '18:00');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [step, setStep] = useState<OrderStep>(initial?.step ?? 'select');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addOrder, guestInfo } = useGuestStore();
  const { toast } = useToast();

  const selectedSetData = BBQ_SETS.find((set) => set.id === selectedSet);

  const handleSubmit = async () => {
    if (!selectedSet || !selectedSetData) {
      toast({
        title: '선택 필요',
        description: '세트를 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    const orderType: 'bbq' | 'fire' = selectedSet.startsWith('bbq') ? 'bbq' : 'fire';

    const order = {
      type: orderType,
      items: [
        {
          id: selectedSet,
          name: selectedSetData.name,
          quantity,
          price: selectedSetData.price,
        },
      ],
      totalAmount: selectedSetData.price * quantity,
      deliveryTime,
      notes,
    };

    try {
      setIsSubmitting(true);
      // 1. Railway 백엔드에 주문 저장
      await createOrder(token, {
        type: order.type,
        items: order.items,
        totalAmount: order.totalAmount,
        deliveryTime: order.deliveryTime,
        notes: order.notes,
      });

      // 2. 로컬 스토어에 추가
      addOrder(order);

      // 3. n8n 웹훅으로 알림 전송 (비동기, 실패해도 주문은 저장됨)
      sendOrderToN8N({
        guest: guestInfo.name,
        room: guestInfo.room,
        orderType: order.type,
        items: order.items,
        totalAmount: order.totalAmount,
        deliveryTime: order.deliveryTime,
        notes: order.notes,
      }).catch((error) => {
        console.error('Failed to send order notification to n8n:', error);
        // n8n 전송 실패는 로그만 남기고 사용자에게는 알리지 않음
      });

      toast({
        title: '주문 완료',
        description: '주문이 접수되었습니다. 곧 준비해드리겠습니다!',
      });

      onClose();
    } catch (error) {
      console.error('Failed to create order:', error);
      toast({
        title: '주문 실패',
        description: '주문 접수에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = () => {
    if (step === 'select') {
      if (!selectedSet) {
        toast({
          title: '선택 필요',
          description: '세트를 선택해주세요.',
          variant: 'destructive',
        });
        return;
      }
      setStep('quantity');
      return;
    }
    if (step === 'quantity') {
      setStep('time');
      return;
    }
    if (step === 'time') {
      if (!deliveryTime) {
        toast({
          title: '배송 시간 필요',
          description: '배송 시간을 선택해주세요.',
          variant: 'destructive',
        });
        return;
      }
      setStep('review');
      return;
    }
  };

  const goBack = () => {
    if (step === 'quantity') return setStep('select');
    if (step === 'time') return setStep('quantity');
    if (step === 'review') return setStep('time');
  };

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold text-center">불멍/바베큐 주문</DrawerTitle>
            <div className="mt-3 flex items-center justify-center gap-2">
              {(['select', 'quantity', 'time', 'review'] as OrderStep[]).map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-10 rounded-full transition-colors ${
                    s === step ? 'bg-primary' : 'bg-muted'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </DrawerHeader>

          <div className="space-y-6 px-4 py-2 overflow-y-auto max-h-[calc(85vh-150px)]">
            {/* Step 1: Set Selection */}
            {step === 'select' && (
              <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
                <label className="mb-2 block text-sm font-medium">1) 세트 선택</label>
                <div className="space-y-2">
                  {BBQ_SETS.map((set) => (
                    <button
                      key={set.id}
                      onClick={() => setSelectedSet(set.id)}
                      className={`w-full rounded-lg border p-4 text-left transition-all duration-200 ${
                        selectedSet === set.id
                          ? 'border-primary bg-primary/10 ring-2 ring-primary shadow-md scale-[1.02]'
                          : 'border-border hover:bg-muted/50 hover:border-primary/30 hover:shadow-sm active:scale-[0.98]'
                      }`}
                      aria-label={`${set.name} 선택`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base">{set.name}</h4>
                          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                            {set.items.join(', ')}
                          </p>
                        </div>
                        <p
                          className={`font-bold text-lg ml-4 transition-colors ${
                            selectedSet === set.id ? 'text-primary' : 'text-foreground'
                          }`}
                        >
                          {set.price.toLocaleString()}원
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Quantity */}
            {step === 'quantity' && selectedSetData && (
              <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-200 space-y-4">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="text-sm font-semibold">{selectedSetData.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selectedSetData.items.join(', ')}</p>
                </div>
                <div>
                  <label className="mb-3 block text-sm font-semibold">2) 수량</label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-lg transition-all hover:bg-primary/10 hover:border-primary active:scale-95"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      aria-label="수량 감소"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-foreground">{quantity}</span>
                        <span className="text-sm text-muted-foreground ml-2">개</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-lg transition-all hover:bg-primary/10 hover:border-primary active:scale-95"
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="수량 증가"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Time + Notes */}
            {step === 'time' && (
              <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-200 space-y-5">
                <div>
                  <label className="mb-2.5 block text-sm font-semibold">3) 배송 시간</label>
                  <Input
                    type="time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="h-12 text-lg font-medium transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="배송 시간 선택"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    요청 시간에 맞춰 준비해드릴게요. 혼잡 시 약간 지연될 수 있어요.
                  </p>
                </div>

                <div>
                  <label className="mb-2.5 block text-sm font-semibold">요청사항 (선택)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="예: 문 앞에 놓아주세요"
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm min-h-[100px] transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2 resize-none"
                    rows={4}
                    aria-label="요청사항 입력"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 'review' && selectedSetData && (
              <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-200 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  확인 후 주문을 완료해주세요
                </div>

                <div className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{selectedSetData.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{selectedSetData.items.join(', ')}</p>
                    </div>
                    <p className="font-bold">{selectedSetData.price.toLocaleString()}원</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">수량</span>
                    <span className="font-semibold">{quantity}개</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">배송 시간</span>
                    <span className="font-semibold">{deliveryTime}</span>
                  </div>
                  {notes.trim() ? (
                    <div className="text-sm">
                      <p className="text-muted-foreground">요청사항</p>
                      <p className="mt-1 leading-relaxed">{notes}</p>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-5 border-2 border-primary/20 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">총 결제 금액</span>
                    <span className="text-3xl font-black text-primary">
                      {(selectedSetData.price * quantity).toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DrawerFooter className="px-4 pb-8 pt-4 border-t">
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={step === 'select' ? onClose : goBack}
                className="flex-1 h-12 text-base transition-all hover:bg-muted active:scale-95"
                disabled={isSubmitting}
              >
                {step === 'select' ? '닫기' : '이전'}
              </Button>

              {step !== 'review' ? (
                <Button
                  onClick={goNext}
                  className="flex-[2] h-12 text-base font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                  disabled={isSubmitting}
                >
                  다음
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="flex-[2] h-12 text-base font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '주문 처리 중…' : '주문 완료'}
                </Button>
              )}
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
