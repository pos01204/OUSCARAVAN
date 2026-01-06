'use client';

import { useState, useEffect } from 'react';
import { getRooms, createRoom, updateRoom, deleteRoom, type Room } from '@/lib/api';
import { logError } from '@/lib/logger';
import { validateRequired, validateLength, validateRange } from '@/lib/validation';
import { extractUserFriendlyMessage } from '@/lib/error-messages';
import { sanitizeInput } from '@/lib/security';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function RoomsPage() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: 1,
    status: 'available' as Room['status'],
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const data = await getRooms();
      setRooms(data);
    } catch (error) {
      logError('Failed to fetch rooms', error, {
        component: 'RoomsPage',
      });
      
      // 401 에러인 경우 로그인 페이지로 리다이렉트
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        // 쿠키 삭제
        document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login';
        return;
      }
      
      toast({
        title: '오류',
        description: extractUserFriendlyMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 방 목록 조회
  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      capacity: 1,
      status: 'available',
    });
    setEditingRoom(null);
  };
  
  // 방 추가/수정 다이얼로그 열기
  const handleOpenDialog = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        type: room.type,
        capacity: room.capacity,
        status: room.status,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };
  
  // 방 저장
  const handleSave = async () => {
    // 입력 검증
    if (!validateRequired(formData.name) || !validateRequired(formData.type)) {
      toast({
        title: '입력 필요',
        description: '방 이름과 타입을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!validateLength(formData.name, 1, 50)) {
      toast({
        title: '입력 오류',
        description: '방 이름은 1자 이상 50자 이하여야 합니다.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!validateLength(formData.type, 1, 100)) {
      toast({
        title: '입력 오류',
        description: '방 타입은 1자 이상 100자 이하여야 합니다.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!validateRange(formData.capacity, 1, 20)) {
      toast({
        title: '입력 오류',
        description: '수용 인원은 1명 이상 20명 이하여야 합니다.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // 입력값 정리 (보안)
      const sanitizedFormData = {
        name: sanitizeInput(formData.name, { maxLength: 50 }),
        type: sanitizeInput(formData.type, { maxLength: 100 }),
        capacity: formData.capacity,
        status: formData.status,
      };
      
      if (editingRoom) {
        // 수정
        await updateRoom(editingRoom.id, sanitizedFormData);
        toast({
          title: '수정 완료',
          description: '방 정보가 수정되었습니다.',
        });
      } else {
        // 추가
        await createRoom(sanitizedFormData);
        toast({
          title: '추가 완료',
          description: '방이 추가되었습니다.',
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchRooms();
    } catch (error) {
      logError('Failed to save room', error, {
        component: 'RoomsPage',
        action: editingRoom ? 'update' : 'create',
        roomData: formData,
      });
      toast({
        title: '저장 실패',
        description: '방 정보 저장에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // 방 삭제
  const handleDelete = async (roomId: string) => {
    if (!confirm('정말 이 방을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      await deleteRoom(roomId);
      toast({
        title: '삭제 완료',
        description: '방이 삭제되었습니다.',
      });
      fetchRooms();
    } catch (error) {
      logError('Failed to delete room', error, {
        component: 'RoomsPage',
        roomId,
      });
      
      // 사용자 친화적인 에러 메시지 추출
      const errorMessage = extractUserFriendlyMessage(error);
      
      toast({
        title: '삭제 실패',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  
  const getStatusBadge = (status: Room['status']) => {
    const variants: Record<Room['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      available: { label: '사용 가능', variant: 'default' },
      occupied: { label: '사용 중', variant: 'secondary' },
      maintenance: { label: '점검 중', variant: 'destructive' },
    };
    
    const { label, variant } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">방 관리</h1>
          <p className="text-muted-foreground">
            방 목록 및 관리
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          방 추가
        </Button>
      </div>
      
      {rooms.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              등록된 방이 없습니다.
            </p>
            <Button onClick={() => handleOpenDialog()} className="mt-4">
              첫 번째 방 추가하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{room.name}</CardTitle>
                  {getStatusBadge(room.status)}
                </div>
                <CardDescription>{room.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">수용 인원</p>
                    <p className="font-medium">{room.capacity}명</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(room)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(room.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* 방 추가/수정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? '방 수정' : '방 추가'}
            </DialogTitle>
            <DialogDescription>
              방 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">방 이름 *</Label>
              <Input
                id="name"
                placeholder="예: A1, B2, 오션뷰카라반"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">방 타입 *</Label>
              <Input
                id="type"
                placeholder="예: 오션뷰카라반, 힐뷰카라반"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">수용 인원 *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">상태 *</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Room['status'] })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="available">사용 가능</option>
                <option value="occupied">사용 중</option>
                <option value="maintenance">점검 중</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
            >
              취소
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
