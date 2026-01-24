'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { formatDateTimeToKorean } from '@/lib/utils/date';
import {
  createAnnouncement,
  deleteAnnouncement,
  getAdminAnnouncements,
  updateAnnouncement,
  type Announcement,
  type AnnouncementLevel,
} from '@/lib/api';
import { logError } from '@/lib/logger';
import { Loader2, RefreshCw, Edit, Trash2, EyeOff, Eye, Copy } from 'lucide-react';

interface AnnouncementFormState {
  title: string;
  content: string;
  level: AnnouncementLevel;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

const LEVEL_OPTIONS: Array<{ value: AnnouncementLevel; label: string }> = [
  { value: 'info', label: '일반' },
  { value: 'warning', label: '주의' },
  { value: 'critical', label: '긴급' },
];

const TEMPLATE_PRESETS: Array<{
  label: string;
  title: string;
  content: string;
  level: AnnouncementLevel;
}> = [
  {
    label: '비/눈 안내',
    title: '비/눈 예보 안내',
    content: '비/눈 예보로 인해 차량 이동이 필요할 수 있습니다. 필요 시 안내에 따라 이동해 주세요.',
    level: 'warning',
  },
  {
    label: '차량 이동 요청',
    title: '차량 이동 요청',
    content: '주차 공간 정리를 위해 차량 이동이 필요합니다. 안내 문자를 확인해 주세요.',
    level: 'warning',
  },
  {
    label: '신발 보관 안내',
    title: '신발 보관 안내',
    content: '외부 활동 후 신발 보관을 위해 신발을 정리해 주세요. 필요한 경우 안내 데스크로 문의 바랍니다.',
    level: 'info',
  },
];

function toLocalDateTimeInput(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toUtcISOString(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function formatPreviewDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return formatDateTimeToKorean(date);
}

function getStatusLabel(announcement: Announcement) {
  const now = new Date();
  const startsAt = new Date(announcement.startsAt);
  const endsAt = announcement.endsAt ? new Date(announcement.endsAt) : null;

  if (!announcement.isActive) return { label: '비활성', className: 'bg-muted text-muted-foreground' };
  if (startsAt > now) return { label: '예약', className: 'bg-blue-100 text-blue-800 border-blue-200' };
  if (endsAt && endsAt < now) return { label: '종료', className: 'bg-gray-100 text-gray-800 border-gray-200' };
  return { label: '진행중', className: 'bg-green-100 text-green-800 border-green-200' };
}

function getLevelBadge(level: AnnouncementLevel) {
  switch (level) {
    case 'critical':
      return { label: '긴급', className: 'bg-red-100 text-red-800 border-red-200' };
    case 'warning':
      return { label: '주의', className: 'bg-orange-100 text-orange-800 border-orange-200' };
    default:
      return { label: '일반', className: 'bg-blue-100 text-blue-800 border-blue-200' };
  }
}

const defaultFormState: AnnouncementFormState = {
  title: '',
  content: '',
  level: 'info',
  startsAt: toLocalDateTimeInput(new Date().toISOString()),
  endsAt: '',
  isActive: true,
};

export default function AnnouncementsPage() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<AnnouncementFormState>({ ...defaultFormState });
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [editForm, setEditForm] = useState<AnnouncementFormState>({ ...defaultFormState });
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const data = await getAdminAnnouncements({
        status: 'active',
        limit: 50,
      });
      setAnnouncements(data.announcements || []);
    } catch (error) {
      logError('Failed to fetch announcements', error, {
        component: 'AnnouncementsPage',
      });
      toast({
        title: '공지 조회 실패',
        description: '목록 조회 실패',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({
        title: '입력 필요',
        description: '제목/내용 입력',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createAnnouncement({
        title: form.title.trim(),
        content: form.content.trim(),
        level: form.level,
        startsAt: toUtcISOString(form.startsAt),
        endsAt: form.endsAt ? toUtcISOString(form.endsAt) : null,
        isActive: form.isActive,
      });
      toast({
        title: '공지 등록됨',
      });
      setForm({ ...defaultFormState });
      fetchAnnouncements();
    } catch (error) {
      logError('Failed to create announcement', error, { component: 'AnnouncementsPage' });
      toast({
        title: '등록 실패',
        description: '공지 등록 실패',
        variant: 'destructive',
      });
    }
  };

  const openEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setEditForm({
      title: announcement.title,
      content: announcement.content,
      level: announcement.level,
      startsAt: toLocalDateTimeInput(announcement.startsAt),
      endsAt: toLocalDateTimeInput(announcement.endsAt),
      isActive: announcement.isActive,
    });
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (!editForm.title.trim() || !editForm.content.trim()) {
      toast({
        title: '입력 필요',
        description: '제목/내용 입력',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateAnnouncement(editing.id, {
        title: editForm.title.trim(),
        content: editForm.content.trim(),
        level: editForm.level,
        startsAt: toUtcISOString(editForm.startsAt),
        endsAt: editForm.endsAt ? toUtcISOString(editForm.endsAt) : null,
        isActive: editForm.isActive,
      });
      toast({
        title: '공지 수정됨',
      });
      setEditing(null);
      fetchAnnouncements();
    } catch (error) {
      logError('Failed to update announcement', error, { component: 'AnnouncementsPage', id: editing.id });
      toast({
        title: '수정 실패',
        description: '공지 수정 실패',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      await updateAnnouncement(announcement.id, { isActive: !announcement.isActive });
      fetchAnnouncements();
    } catch (error) {
      logError('Failed to toggle announcement', error, { component: 'AnnouncementsPage', id: announcement.id });
      toast({
        title: '상태 변경 실패',
        description: '공지 상태 변경 실패',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (announcement: Announcement) => {
    const confirmed = window.confirm('이 공지를 삭제할까요? 삭제된 공지는 복구할 수 없습니다.');
    if (!confirmed) return;

    try {
      await deleteAnnouncement(announcement.id);
      toast({
        title: '공지 삭제됨',
      });
      fetchAnnouncements();
    } catch (error) {
      logError('Failed to delete announcement', error, { component: 'AnnouncementsPage', id: announcement.id });
      toast({
        title: '삭제 실패',
        description: '공지 삭제 실패',
        variant: 'destructive',
      });
    }
  };

  const filteredCountLabel = useMemo(() => {
    if (isLoading) return '불러오는 중...';
    if (announcements.length === 0) return '공지 없음';
    return `${announcements.length}건`;
  }, [announcements.length, isLoading]);

  const applyTemplate = (template: (typeof TEMPLATE_PRESETS)[number]) => {
    setSelectedTemplate(template.label);
    setForm((prev) => ({
      ...prev,
      title: template.title,
      content: template.content,
      level: template.level,
    }));
  };

  const copyToForm = (announcement: Announcement) => {
    setSelectedTemplate(null);
    setForm((prev) => ({
      ...prev,
      title: announcement.title,
      content: announcement.content,
      level: announcement.level,
      startsAt: toLocalDateTimeInput(new Date().toISOString()),
      endsAt: '',
      isActive: true,
    }));
    toast({
      title: '폼에 복사됨',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">고객 공지 관리</h1>
          <p className="text-sm text-muted-foreground">
            비/눈, 차량 이동, 준비물 등 안내가 필요할 때 고객에게 공지를 전달합니다.
          </p>
        </div>
        <Button variant="outline" onClick={fetchAnnouncements} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          새로고침
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>공지 작성</CardTitle>
          <CardDescription>고객 홈 상단에 노출될 공지를 등록하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_PRESETS.map((template) => (
              <Button
                key={template.label}
                variant={selectedTemplate === template.label ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyTemplate(template)}
              >
                {template.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="announcement-title">제목</Label>
              <Input
                id="announcement-title"
                placeholder="예: 비가 오는 날 차량 이동 안내"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>중요도</Label>
              <Select
                value={form.level}
                onValueChange={(value: AnnouncementLevel) => setForm((prev) => ({ ...prev, level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="중요도 선택" />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcement-content">내용</Label>
            <textarea
              id="announcement-content"
              className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="공지 내용을 입력하세요."
              value={form.content}
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="announcement-starts">노출 시작</Label>
              <Input
                id="announcement-starts"
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-ends">노출 종료 (선택)</Label>
              <Input
                id="announcement-ends"
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) => setForm((prev) => ({ ...prev, endsAt: event.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={form.isActive}
                onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
              />
              즉시 노출
            </label>
            <Button onClick={handleCreate}>공지 등록</Button>
          </div>

          <Card className="border-dashed border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">고객 노출 미리보기</CardTitle>
              <CardDescription>입력한 내용이 고객 화면에 이렇게 보입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getLevelBadge(form.level).className}>
                  {getLevelBadge(form.level).label}
                </Badge>
                {!form.isActive && <Badge variant="outline">비활성</Badge>}
              </div>
              <p className="text-sm font-semibold">{form.title || '제목을 입력하세요'}</p>
              <p className="text-xs text-muted-foreground whitespace-pre-line">
                {form.content || '내용을 입력하세요'}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {form.startsAt ? `노출 시작: ${formatPreviewDate(form.startsAt)}` : '노출 시작 시간 미입력'}
                {form.endsAt ? ` · 노출 종료: ${formatPreviewDate(form.endsAt)}` : ''}
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>공지 목록</CardTitle>
          <CardDescription>현재 진행 중인 공지 사항입니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">총 {filteredCountLabel}</div>

          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                목록을 불러오는 중...
              </CardContent>
            </Card>
          ) : announcements.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">등록된 공지가 없습니다.</CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => {
                const status = getStatusLabel(announcement);
                const level = getLevelBadge(announcement.level);
                return (
                  <Card key={announcement.id} className="border-l-4 border-l-primary/30">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold">{announcement.title}</h3>
                            <Badge variant="outline" className={level.className}>
                              {level.label}
                            </Badge>
                            <Badge variant="outline" className={status.className}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {announcement.content}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            노출 기간: {formatDateTimeToKorean(announcement.startsAt)}
                            {announcement.endsAt ? ` ~ ${formatDateTimeToKorean(announcement.endsAt)}` : ' (종료 없음)'}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(announcement)}>
                            <Edit className="mr-2 h-4 w-4" /> 수정
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => copyToForm(announcement)}>
                            <Copy className="mr-2 h-4 w-4" /> 복사
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(announcement)}
                          >
                            {announcement.isActive ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" /> 비활성
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" /> 활성
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(announcement)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> 삭제
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>공지 수정</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">제목</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>중요도</Label>
              <Select
                value={editForm.level}
                onValueChange={(value: AnnouncementLevel) =>
                  setEditForm((prev) => ({ ...prev, level: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="중요도 선택" />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">내용</Label>
              <textarea
                id="edit-content"
                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={editForm.content}
                onChange={(event) => setEditForm((prev) => ({ ...prev, content: event.target.value }))}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-starts">노출 시작</Label>
                <Input
                  id="edit-starts"
                  type="datetime-local"
                  value={editForm.startsAt}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, startsAt: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ends">노출 종료</Label>
                <Input
                  id="edit-ends"
                  type="datetime-local"
                  value={editForm.endsAt}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, endsAt: event.target.value }))}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={editForm.isActive}
                onChange={(event) => setEditForm((prev) => ({ ...prev, isActive: event.target.checked }))}
              />
              즉시 노출
            </label>
            <div className="flex gap-2">
              <Button onClick={handleUpdate}>저장</Button>
              <Button variant="outline" onClick={() => setEditing(null)}>
                닫기
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
