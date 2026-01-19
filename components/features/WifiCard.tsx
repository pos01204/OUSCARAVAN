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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            WiFi 연결
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">SSID</p>
            <p className="text-lg font-semibold">{WIFI_INFO.ssid}</p>
          </div>
          {showPasswordFallback && (
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">비밀번호(직접 복사)</p>
              <p className="mt-1 font-mono text-base select-all">{WIFI_INFO.password}</p>
              <p className="mt-1 text-xs text-muted-foreground">길게 눌러 복사할 수 있어요.</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={copyPassword} className="flex-1" aria-label="WiFi 비밀번호 복사">
              <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
              비밀번호 복사
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
          <div className="rounded-lg bg-white p-4">
            <QRCodeSVG value={`WIFI:T:WPA;S:${WIFI_INFO.ssid};P:${WIFI_INFO.password};;`} size={256} />
          </div>
          <div className="w-full rounded-lg border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">SSID</p>
            <p className="font-semibold">{WIFI_INFO.ssid}</p>
            <p className="mt-2 text-xs text-muted-foreground">비밀번호</p>
            <p className="font-mono select-all">{WIFI_INFO.password}</p>
          </div>
        </div>
      </InfoInspector>
    </>
  );
}
