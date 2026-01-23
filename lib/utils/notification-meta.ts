import type { Notification } from '@/types';
import { Calendar, CheckCircle, Clock, ShoppingCart } from 'lucide-react';

export type NotificationType = Notification['type'];

export type NotificationTypeMeta = {
  type: NotificationType;
  icon: React.ComponentType<{ className?: string }>;
  colorClassName: string;
};

const DEFAULT_META: NotificationTypeMeta = {
  type: 'order_created',
  icon: Clock,
  colorClassName: 'bg-gray-100 text-gray-800 border-gray-200',
};

const META: Partial<Record<NotificationType, NotificationTypeMeta>> = {
  order_created: {
    type: 'order_created',
    icon: ShoppingCart,
    colorClassName: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  checkin: {
    type: 'checkin',
    icon: CheckCircle,
    colorClassName: 'bg-green-100 text-green-800 border-green-200',
  },
  checkout: {
    type: 'checkout',
    icon: CheckCircle,
    colorClassName: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  reservation_assigned: {
    type: 'reservation_assigned',
    icon: Calendar,
    colorClassName: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  reservation_cancelled: {
    type: 'reservation_cancelled',
    icon: Calendar,
    colorClassName: 'bg-orange-100 text-orange-800 border-orange-200',
  },
};

export function getNotificationTypeMeta(type: NotificationType): NotificationTypeMeta {
  return META[type] ?? { ...DEFAULT_META, type };
}

