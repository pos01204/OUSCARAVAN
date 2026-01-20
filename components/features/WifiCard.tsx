'use client';

import { useState } from 'react';
import { Wifi, Copy, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WIFI_INFO } from '@/lib/constants';
import { useToast } from '@/components/ui/use-toast';
import Confetti from 'react-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { InfoInspector } from '@/components/guest/InfoInspector';
import { useReducedMotion } from 'framer-motion';

export function WifiCard() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [openQr, setOpenQr] = useState(false);
  const [showPasswordFallback, setShowPasswordFallback] = useState(false);
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();

  const canPlayConfetti = () => {
    if (reduceMotion) return false;
    if (typeof window === 'undefined') return false;
    try {
      const key = 'guest:wifiConfettiShown';
      const already = window.sessionStorage.getItem(key);
      if (already) return false;
      window.sessionStorage.setItem(key, '1');
      return true;
    } catch {
      return true;
    }
  };

  const copyPassword = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error('Clipboard API not supported');
      }
      await navigator.clipboard.writeText(WIFI_INFO.password);
      if (canPlayConfetti()) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
      }
      toast({
        title: '비밀번호 복사됨',
        description: 'WiFi 비밀번호가 클립보드에 복사되었습니다.',
      });
    } catch (err) {
      setShowPasswordFallback(true);
      toast({
        title: '복사 실패',
        description: '비밀번호를 직접 확인 후 복사해주세요.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 0}
          height={typeof window !== 'undefined' ? window.innerHeight : 0}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-brand-dark">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Wifi className="h-4 w-4" strokeWidth={2.5} />
            </div>
            WiFi 연결하기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-background-muted p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-brand-dark-muted font-medium">네트워크</p>
                <p className="text-base font-semibold text-brand-dark">{WIFI_INFO.ssid}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-brand-dark-muted font-medium">비밀번호</p>
                <p className="text-base font-mono font-semibold text-brand-dark">{WIFI_INFO.password}</p>
              </div>
            </div>
          </div>
          {showPasswordFallback && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-700 font-medium">비밀번호(직접 복사)</p>
              <p className="mt-1 font-mono text-base select-all text-amber-900">{WIFI_INFO.password}</p>
              <p className="mt-1 text-xs text-amber-600">길게 눌러 복사할 수 있어요.</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={copyPassword} className="flex-1" aria-label="WiFi 비밀번호 복사">
              <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
              비밀번호 복사하기
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              aria-label="WiFi QR 코드 보기"
              onClick={() => setOpenQr(true)}
            >
              <QrCode className="mr-2 h-4 w-4" aria-hidden="true" />
              QR 코드
            </Button>
          </div>
        </CardContent>
      </Card>

      <InfoInspector
        open={openQr}
        onOpenChange={setOpenQr}
        title="WiFi QR 코드"
        description="이 QR 코드를 스캔하여 WiFi에 연결하세요"
        contentClassName="md:max-w-md"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="rounded-2xl bg-white p-6 shadow-soft-md border border-brand-cream-dark/20">
            <QRCodeSVG value={`WIFI:T:WPA;S:${WIFI_INFO.ssid};P:${WIFI_INFO.password};;`} size={220} />
          </div>
          <div className="w-full rounded-xl bg-background-muted p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-brand-dark-muted font-medium">네트워크</p>
                <p className="font-semibold text-brand-dark">{WIFI_INFO.ssid}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-brand-dark-muted font-medium">비밀번호</p>
                <p className="font-mono select-all text-brand-dark">{WIFI_INFO.password}</p>
              </div>
            </div>
          </div>
        </div>
      </InfoInspector>
    </>
  );
}
