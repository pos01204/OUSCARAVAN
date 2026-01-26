'use client';

import { Wifi, ChevronLeft, Signal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WiFiNetwork {
  name: string;
  signal: 'strong' | 'medium' | 'weak';
  isRecommended?: boolean;
}

const MOCK_NETWORKS: WiFiNetwork[] = [
  { name: 'OUS_Caravan_A1', signal: 'strong', isRecommended: true },
  { name: 'OUS_Caravan_B2', signal: 'medium' },
  { name: 'Other_Network', signal: 'weak' },
  { name: 'Neighbor_WiFi', signal: 'weak' },
];

function SignalIcon({ signal }: { signal: 'strong' | 'medium' | 'weak' }) {
  const bars = signal === 'strong' ? 4 : signal === 'medium' ? 2 : 1;
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-1 rounded-sm transition-colors ${
            i <= bars 
              ? signal === 'strong' ? 'bg-status-success' : 'bg-muted-foreground'
              : 'bg-muted'
          }`}
          style={{ height: `${i * 3 + 2}px` }}
        />
      ))}
    </div>
  );
}

export function WiFiMockup() {
  return (
    <div className="flex flex-col items-center">
      {/* 안내 텍스트 */}
      <p className="text-xs text-brand-dark-muted mb-3 text-center">
        아래와 같이 <span className="font-semibold text-brand-dark">신호가 가장 강한 WiFi</span>를 선택하세요
      </p>
      
      {/* 스마트폰 목업 */}
      <div className="w-full max-w-[300px]">
        {/* 폰 프레임 */}
        <div className="rounded-[1.5rem] border-[3px] border-brand-dark/80 bg-white shadow-lg overflow-hidden">
          {/* 상단 노치 */}
          <div className="h-6 bg-brand-dark/5 flex items-center justify-center">
            <div className="w-16 h-1 bg-brand-dark/20 rounded-full" />
          </div>
          
          {/* 화면 내용 */}
          <div className="p-3">
            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-4">
              <ChevronLeft className="h-5 w-5 text-brand-dark" />
              <span className="text-sm font-semibold text-brand-dark">Wi-Fi</span>
            </div>
            
            {/* 사용 중 토글 */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-brand-cream/30 mb-3">
              <span className="text-xs font-medium text-brand-dark">사용 중</span>
              <div className="w-9 h-5 rounded-full bg-status-info flex items-center justify-end px-0.5">
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
            
            {/* 네트워크 목록 */}
            <p className="text-[10px] text-muted-foreground mb-2 px-1">사용 가능한 네트워크</p>
            <div className="space-y-1.5">
              {MOCK_NETWORKS.map((network) => (
                <div
                  key={network.name}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all ${
                    network.isRecommended
                      ? 'bg-status-success/10 border-2 border-status-success ring-2 ring-status-success/20'
                      : 'bg-muted/30 opacity-50'
                  }`}
                >
                  <Wifi className={`h-4 w-4 ${
                    network.isRecommended ? 'text-status-success' : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${
                      network.isRecommended ? 'text-brand-dark' : 'text-muted-foreground'
                    }`}>
                      {network.name}
                    </p>
                    {network.isRecommended && (
                      <p className="text-[10px] text-status-success font-medium">
                        신호 강함 · 이 네트워크 선택
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <SignalIcon signal={network.signal} />
                    {network.isRecommended && (
                      <Badge variant="success" className="h-5 text-[9px]">
                        추천
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 홈 인디케이터 */}
          <div className="h-5 flex items-center justify-center">
            <div className="w-24 h-1 bg-brand-dark/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
