import { create } from 'zustand';

export interface GuestInfo {
  name: string;
  room: string;
  checkinDate: string | null;
  checkoutDate: string | null;
}

export interface Order {
  id: string;
  type: 'bbq' | 'fire' | 'kiosk';
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'delivering' | 'completed';
  createdAt: string;
  deliveryTime?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface GuestStore {
  // 게스트 정보
  guestInfo: GuestInfo;
  
  // 상태
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  
  // 주문
  orders: Order[];
  
  // 액션
  setGuestInfo: (info: Partial<GuestInfo>) => void;
  checkIn: () => void;
  checkOut: () => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const useGuestStore = create<GuestStore>((set) => ({
  // 초기 상태
  guestInfo: {
    name: 'Guest',
    room: '', // 호수 정보는 저장하되 고객에게 노출하지 않음 (관리자 편의용)
    checkinDate: null,
    checkoutDate: null,
  },
  isCheckedIn: false,
  isCheckedOut: false,
  orders: [],
  
  // 액션
  setGuestInfo: (info) =>
    set((state) => ({
      guestInfo: { ...state.guestInfo, ...info },
    })),
  
  checkIn: () =>
    set({
      isCheckedIn: true,
      guestInfo: {
        ...useGuestStore.getState().guestInfo,
        checkinDate: new Date().toISOString(),
      },
    }),
  
  checkOut: () =>
    set({
      isCheckedOut: true,
      guestInfo: {
        ...useGuestStore.getState().guestInfo,
        checkoutDate: new Date().toISOString(),
      },
    }),
  
  addOrder: (order) => {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    set((state) => ({
      orders: [...state.orders, newOrder],
    }));
    
    // 향후: n8n 웹훅으로 전송
    // sendToN8N('order', newOrder);
  },
  
  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    })),
}));
