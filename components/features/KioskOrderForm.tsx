'use client';

import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KIOSK_ITEMS } from '@/lib/constants';
import { useGuestStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { sendOrderToN8N, createOrder } from '@/lib/api';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

interface KioskOrderFormProps {
  onClose: () => void;
  token: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function KioskOrderForm({ onClose, token }: KioskOrderFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryTime, setDeliveryTime] = useState('18:00');
  const [notes, setNotes] = useState('');
  const { addOrder, guestInfo } = useGuestStore();
  const { toast } = useToast();

  const categories = Object.values(KIOSK_ITEMS);
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  const addToCart = (itemId: string, itemName: string, itemPrice: number) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === itemId);
      if (existingItem) {
        return prev.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { id: itemId, name: itemName, price: itemPrice, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.id === itemId);
      if (!item) return prev;

      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        return prev.filter(i => i.id !== itemId);
      }

      return prev.map(i =>
        i.id === itemId ? { ...i, quantity: newQuantity } : i
      );
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast({
        title: '선택 필요',
        description: '주문할 물품을 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    const order = {
      type: 'kiosk' as const,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
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
            <DrawerTitle className="text-xl font-bold text-center">키오스크 물품 주문</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-6 px-4 py-2 overflow-y-auto max-h-[calc(85vh-150px)]">
            {/* 카테고리 선택 */}
            <div>
              <label className="mb-3 block text-sm font-semibold">카테고리 선택</label>
              <div className="grid grid-cols-3 gap-2.5">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`rounded-lg border p-3.5 text-center transition-all duration-200 text-sm font-semibold ${
                      selectedCategory === category.id
                        ? 'border-primary bg-primary/10 ring-2 ring-primary shadow-md scale-[1.02]'
                        : 'border-border hover:bg-muted/50 hover:border-primary/30 hover:shadow-sm active:scale-[0.98]'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 상품 선택 */}
            {selectedCategoryData && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label className="mb-3 block text-sm font-semibold">
                  {selectedCategoryData.name} 상품
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {selectedCategoryData.items.map((item) => {
                    const cartItem = cart.find(c => c.id === item.id);
                    const quantity = cartItem?.quantity || 0;

                    return (
                      <Card 
                        key={item.id} 
                        className={`overflow-hidden transition-all duration-200 ${
                          quantity > 0 
                            ? 'border-primary/30 bg-primary/5 shadow-sm' 
                            : 'hover:shadow-md hover:border-primary/20'
                        }`}
                      >
                        <CardContent className="p-3.5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1 font-medium">
                                {item.price.toLocaleString()}원
                              </p>
                            </div>
                          </div>
                          {quantity > 0 ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg transition-all hover:bg-primary/10 hover:border-primary active:scale-95"
                                  onClick={() => updateQuantity(item.id, -1)}
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </Button>
                                <span className="text-base font-bold text-foreground min-w-[24px] text-center">
                                  {quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg transition-all hover:bg-primary/10 hover:border-primary active:scale-95"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full h-7 text-xs transition-all hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => removeFromCart(item.id)}
                              >
                                삭제
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-9 text-xs font-medium transition-all hover:bg-primary/10 hover:border-primary hover:text-primary active:scale-95"
                              onClick={() => addToCart(item.id, item.name, item.price)}
                            >
                              <Plus className="h-3.5 w-3.5 mr-1.5" />
                              추가
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 장바구니 */}
            {cart.length > 0 && (
              <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-1.5 rounded-lg bg-primary/20">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-bold text-base">장바구니</h3>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {cart.length}개
                  </Badge>
                </div>
                <div className="space-y-2.5 mb-4">
                  {cart.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between text-sm p-2 rounded-lg bg-background/50"
                    >
                      <span className="text-muted-foreground font-medium">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-bold text-foreground">
                        {(item.price * item.quantity).toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-primary/30">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base">총액</span>
                    <span className="text-2xl font-black text-primary">
                      {totalAmount.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 배송 시간 */}
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

            {/* 요청사항 */}
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
                disabled={cart.length === 0}
                className="flex-[2] h-12 text-base font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                주문하기 {totalAmount > 0 && `(${totalAmount.toLocaleString()}원)`}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
