'use client';

import { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
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
}

export function OrderForm({ onClose, token }: OrderFormProps) {
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryTime, setDeliveryTime] = useState('18:00');
  const [notes, setNotes] = useState('');
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
      // 1. Railway 백엔드에 주문 저장
      const savedOrder = await createOrder(token, {
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
    }
  };

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold text-center">불멍/바베큐 주문</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-6 px-4 py-2 overflow-y-auto max-h-[calc(85vh-150px)]">
            {/* Set Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">세트 선택</label>
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
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base">{set.name}</h4>
                        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                          {set.items.join(', ')}
                        </p>
                      </div>
                      <p className={`font-bold text-lg ml-4 transition-colors ${
                        selectedSet === set.id ? 'text-primary' : 'text-foreground'
                      }`}>
                        {set.price.toLocaleString()}원
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            {selectedSet && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label className="mb-3 block text-sm font-semibold">수량</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-lg transition-all hover:bg-primary/10 hover:border-primary active:scale-95"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
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
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Delivery Time */}
            <div>
              <label className="mb-2.5 block text-sm font-semibold">배송 시간</label>
              <Input
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="h-12 text-lg font-medium transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="배송 시간 선택"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="mb-2.5 block text-sm font-semibold">요청사항 (선택사항)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="예: 문 앞에 놓아주세요"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm min-h-[100px] transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2 resize-none"
                rows={4}
                aria-label="요청사항 입력"
              />
            </div>

            {/* Total */}
            {selectedSetData && (
              <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-5 border-2 border-primary/20 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">총 결제 금액</span>
                  <span className="text-3xl font-black text-primary">
                    {(selectedSetData.price * quantity).toLocaleString()}원
                  </span>
                </div>
              </div>
            )}
          </div>

          <DrawerFooter className="px-4 pb-8 pt-4 border-t">
            <div className="flex gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 h-12 text-base transition-all hover:bg-muted active:scale-95"
              >
                취소
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-[2] h-12 text-base font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                주문하기
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
