'use client';

import { useState } from 'react';
import { Calendar, List } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ReservationCalendarView } from './ReservationCalendarView';
import { ReservationListView } from './ReservationListView';
import { type Reservation } from '@/lib/api';

interface ReservationsViewClientProps {
  reservations: Reservation[];
  total?: number;
  search?: string;
  status?: string;
  checkin?: string;
  checkout?: string;
}

export function ReservationsViewClient({
  reservations,
  total,
  search,
  status,
  checkin,
  checkout,
}: ReservationsViewClientProps) {
  const [view, setView] = useState<'list' | 'calendar'>('calendar');

  return (
    <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')} className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TabsList>
            <TabsTrigger value="calendar">
              <Calendar className="mr-2 h-4 w-4" />
              캘린더
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="mr-2 h-4 w-4" />
              리스트
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value="calendar" className="mt-0">
        <ReservationCalendarView reservations={reservations} />
      </TabsContent>

      <TabsContent value="list" className="mt-0">
        <ReservationListView
          reservations={reservations}
          total={total}
          search={search}
          status={status}
          checkin={checkin}
          checkout={checkout}
        />
      </TabsContent>
    </Tabs>
  );
}
