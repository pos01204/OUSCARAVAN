'use client';

import { useState } from 'react';
import { Wifi, Copy, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WIFI_INFO } from '@/lib/constants';
import { useToast } from '@/components/ui/use-toast';
import Confetti from 'react-confetti';
import { Drawer } from 'vaul';
import { QRCodeSVG } from 'qrcode.react';

export function WifiCard() {
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(WIFI_INFO.password);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast({
        title: '비밀번호 복사됨',
        description: 'WiFi 비밀번호가 클립보드에 복사되었습니다.',
      });
    } catch (err) {
      toast({
        title: '복사 실패',
        description: '비밀번호를 복사할 수 없습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
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
          <div className="flex gap-2">
            <Button onClick={copyPassword} className="flex-1" aria-label="WiFi 비밀번호 복사">
              <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
              비밀번호 복사
            </Button>
            <Drawer.Root>
              <Drawer.Trigger asChild>
                <Button variant="outline" className="flex-1" aria-label="WiFi QR 코드 보기">
                  <QrCode className="mr-2 h-4 w-4" aria-hidden="true" />
                  QR 코드
                </Button>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-[80%] flex-col rounded-t-[10px] bg-background">
                  <div className="flex flex-1 flex-col items-center justify-center p-4">
                    <Drawer.Title className="mb-4 text-xl font-semibold">
                      WiFi QR 코드
                    </Drawer.Title>
                    <div className="rounded-lg bg-white p-4">
                      <QRCodeSVG
                        value={`WIFI:T:WPA;S:${WIFI_INFO.ssid};P:${WIFI_INFO.password};;`}
                        size={256}
                      />
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      이 QR 코드를 스캔하여 WiFi에 연결하세요
                    </p>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
