'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BBQ_SETS } from '@/lib/constants';
import { useGuestStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';

interface OrderFormProps {
  onClose: () => void;
}

export function OrderForm({ onClose }: OrderFormProps) {
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryTime, setDeliveryTime] = useState('18:00');
  const [notes, setNotes] = useState('');
  const { addOrder, guestInfo } = useGuestStore();
  const { toast } = useToast();

  const selectedSetData = BBQ_SETS.find((set) => set.id === selectedSet);

  const handleSubmit = () => {
    if (!selectedSet || !selectedSetData) {
      toast({
        title: '선택 필요',
        description: '세트를 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    addOrder({
      type: selectedSet.startsWith('bbq') ? 'bbq' : 'fire',
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
    });

    toast({
      title: '주문 완료',
      description: '주문이 접수되었습니다. 곧 준비해드리겠습니다!',
    });

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>불멍/바베큐 주문</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Set Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium">세트 선택</label>
            <div className="space-y-2">
              {BBQ_SETS.map((set) => (
                <button
                  key={set.id}
                  onClick={() => setSelectedSet(set.id)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    selectedSet === set.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{set.name}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {set.items.join(', ')}
                      </p>
                    </div>
                    <p className="font-semibold text-primary">
                      {set.price.toLocaleString()}원
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          {selectedSet && (
            <div>
              <label className="mb-2 block text-sm font-medium">수량</label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="text-lg font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          )}

          {/* Delivery Time */}
          <div>
            <label className="mb-2 block text-sm font-medium">배송 시간</label>
            <Input
              type="time"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 block text-sm font-medium">요청사항</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="예: 문 앞에 놓아주세요"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              rows={3}
            />
          </div>

          {/* Total */}
          {selectedSetData && (
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">총액</span>
                <span className="text-xl font-bold text-primary">
                  {(selectedSetData.price * quantity).toLocaleString()}원
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            주문하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
