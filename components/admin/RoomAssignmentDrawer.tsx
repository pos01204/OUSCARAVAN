'use client';

import { useState, useEffect, useCallback } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Phone, BedDouble } from 'lucide-react';
import { getRooms, updateReservation, sendReservationAssignedToN8N, type Reservation, type Room } from '@/lib/api';
import { validatePhone, cleanPhone } from '@/lib/validation';
import { sanitizeInput } from '@/lib/security';
import { logError } from '@/lib/logger';
import { extractUserFriendlyMessage } from '@/lib/error-messages';

interface RoomAssignmentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: Reservation | null;
    onAssignSuccess: () => void;
}

export function RoomAssignmentDrawer({
    isOpen,
    onClose,
    reservation,
    onAssignSuccess,
}: RoomAssignmentDrawerProps) {
    const { toast } = useToast();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [assignedRoom, setAssignedRoom] = useState('');
    const [phone, setPhone] = useState('');
    const [sendNotification, setSendNotification] = useState(true);

    // Initialize state when reservation changes
    useEffect(() => {
        if (reservation) {
            setAssignedRoom(reservation.assignedRoom || '');
            setPhone(reservation.phone || '');
        }
    }, [reservation]);

    const fetchRooms = useCallback(async () => {
        try {
            setIsLoadingRooms(true);
            const data = await getRooms();
            setRooms(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
            toast({
                title: '오류',
                description: '방 목록을 불러오지 못했습니다.',
                variant: 'destructive',
            });
        } finally {
            setIsLoadingRooms(false);
        }
    }, [toast]);

    // Fetch rooms when drawer opens
    useEffect(() => {
        if (isOpen) {
            fetchRooms();
        }
    }, [isOpen, fetchRooms]);

    const handleSave = async () => {
        if (!reservation) return;

        if (!assignedRoom) {
            toast({
                title: '방 선택 필요',
                description: '배정할 방을 선택해주세요.',
                variant: 'destructive',
            });
            return;
        }

        if (!phone || phone.trim() === '') {
            toast({
                title: '전화번호 필요',
                description: '연락처는 필수 입력 항목입니다.',
                variant: 'destructive',
            });
            return;
        }

        if (!validatePhone(phone)) {
            toast({
                title: '전화번호 형식 오류',
                description: '올바른 전화번호 형식이 아닙니다.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsSaving(true);

            const uniqueToken = reservation.uniqueToken || crypto.randomUUID();
            const cleanedPhone = cleanPhone(phone);
            const sanitizedRoom = sanitizeInput(assignedRoom, { maxLength: 50 });

            // 1. Update Reservation
            await updateReservation(reservation.id, {
                assignedRoom: sanitizedRoom,
                phone: cleanedPhone,
                uniqueToken,
                status: 'assigned',
            });

            // 2. Send Notification (if checked)
            if (sendNotification) {
                try {
                    await sendReservationAssignedToN8N({
                        reservationId: reservation.id,
                        guestName: reservation.guestName,
                        phone: cleanedPhone,
                        uniqueToken,
                        assignedRoom: sanitizedRoom,
                        checkin: reservation.checkin,
                        checkout: reservation.checkout,
                    });
                } catch (error) {
                    console.error('Failed to send notification', error);
                    // Ignore notification error for UI purposes
                }
            }

            toast({
                title: '배정 완료',
                description: `${sanitizedRoom} 배정이 완료되었습니다.`,
            });

            onAssignSuccess();
            onClose();
        } catch (error) {
            logError('Failed to assign room', error, {
                component: 'RoomAssignmentDrawer',
                reservationId: reservation.id
            });
            toast({
                title: '저장 실패',
                description: extractUserFriendlyMessage(error),
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const sortedRooms = [...rooms]
        .filter(room => !/^[AB]/i.test(room.name)) // 레거시 데이터(A/B동) 명시적으로 제외 (case-insensitive)
        .sort((a, b) => {
            const aMatch = a.name.match(/^(\d+)호$/);
            const bMatch = b.name.match(/^(\d+)호$/);
            if (aMatch && bMatch) {
                return parseInt(aMatch[1]) - parseInt(bMatch[1]);
            }
            return a.name.localeCompare(b.name);
        });

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="max-h-[90vh]">
                <div className="mx-auto w-full max-w-lg">
                    <DrawerHeader>
                        <DrawerTitle className="text-xl font-bold">
                            {reservation?.guestName}님 방 배정
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(85vh-150px)]">
                        {/* Reservation Details Summary */}
                        <div className="bg-muted/30 p-4 rounded-lg space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">체크인</p>
                                    <p className="font-medium">{reservation?.checkin}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">체크아웃</p>
                                    <p className="font-medium">{reservation?.checkout}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">예약 상품</p>
                                <p className="font-medium">{reservation?.roomType}</p>
                            </div>

                            {reservation?.options && reservation.options.length > 0 && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">추가 옵션</p>
                                    <div className="flex flex-wrap gap-1">
                                        {reservation.options.map((option, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs bg-background">
                                                {option.optionName}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Room Selection */}
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                                <BedDouble className="h-4 w-4" />
                                배정할 객실 선택
                            </Label>
                            {isLoadingRooms ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {sortedRooms.map((room) => {
                                        // Check logic could be improved to verify availability
                                        // For now, simple list
                                        const isSelected = assignedRoom === room.name;
                                        return (
                                            <button
                                                key={room.id}
                                                onClick={() => setAssignedRoom(room.name)}
                                                className={`p-3 rounded-lg border text-left transition-all ${isSelected
                                                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                                    : 'border-border hover:bg-accent'
                                                    }`}
                                            >
                                                <div className="font-medium">{room.name}</div>
                                                <div className="text-xs text-muted-foreground">{room.capacity}인실</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-3">
                            <Label htmlFor="drawer-phone" className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                연락처
                            </Label>
                            <Input
                                id="drawer-phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="010-1234-5678"
                                type="tel"
                            />
                        </div>

                        {/* Notification Checkbox */}
                        <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md">
                            <input
                                type="checkbox"
                                id="drawer-send-noti"
                                checked={sendNotification}
                                onChange={(e) => setSendNotification(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="drawer-send-noti" className="text-sm font-normal cursor-pointer">
                                카카오톡 알림 전송
                            </Label>
                        </div>
                    </div>

                    <DrawerFooter className="flex-row gap-2 pb-8">
                        <Button variant="outline" onClick={onClose} className="flex-1 h-12">
                            취소
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving} className="flex-[2] h-12">
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    처리 중...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    배정 완료
                                </>
                            )}
                        </Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
