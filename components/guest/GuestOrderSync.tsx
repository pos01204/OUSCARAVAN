'use client';

import { useEffect } from 'react';
import { getOrders } from '@/lib/api';
import { useGuestStore } from '@/lib/store';

interface GuestOrderSyncProps {
  token: string;
}

/**
 * 게스트 페이지에서 주문 목록을 주기적으로 동기화하는 컴포넌트
 */
export function GuestOrderSync({ token }: GuestOrderSyncProps) {

  // 주문 목록 조회 및 동기화
  const syncOrders = async () => {
    try {
      const response = await getOrders(token);
      const serverOrders = response.orders || [];

      // 서버의 주문 목록으로 스토어 업데이트
      // 기존 주문 상태를 서버 상태로 동기화
      serverOrders.forEach((serverOrder) => {
        const existingOrder = orders.find((o) => o.id === serverOrder.id);
        if (existingOrder && existingOrder.status !== serverOrder.status) {
          // 상태가 변경된 경우 업데이트
          updateOrderStatus(serverOrder.id, serverOrder.status);
        }
      });

      // 스토어의 orders를 서버 orders로 완전히 교체
      // 이렇게 하면 관리자가 주문 상태를 변경해도 게스트 페이지에 반영됨
      useGuestStore.setState({ orders: serverOrders });
    } catch (error) {
      console.error('Failed to sync orders:', error);
      // 에러 발생 시 조용히 실패 (사용자에게 알리지 않음)
    }
  };

  // 컴포넌트 마운트 시 주문 목록 조회
  useEffect(() => {
    syncOrders();
  }, [token]);

  // 주기적으로 주문 목록 동기화 (10초마다)
  useEffect(() => {
    const interval = setInterval(syncOrders, 10000); // 10초마다 동기화

    return () => clearInterval(interval);
  }, [token]);

  // 페이지 포커스 시 동기화
  useEffect(() => {
    const handleFocus = () => {
      syncOrders();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [token]);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
}
