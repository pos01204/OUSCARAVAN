# UI/디자인 진단 및 개선안

> **작성일**: 2026-01-24  
> **범위**: 관리자 페이지, 고객 페이지  
> **목적**: 디자인 시스템, 컴포넌트, UI/UX 현황 진단 및 개선 방향 제시

---

## 📋 목차

1. [디자인 철학 및 방향성](#1-디자인-철학-및-방향성)
2. [종합 요약](#2-종합-요약)
3. [추천 외부 라이브러리](#3-추천-외부-라이브러리)
4. [고객 페이지 개선안](#4-고객-페이지-개선안)
5. [관리자 페이지 개선안](#5-관리자-페이지-개선안)
6. [공통 컴포넌트 개선](#6-공통-컴포넌트-개선)
7. [색상 및 테마 시스템](#7-색상-및-테마-시스템)
8. [타이포그래피](#8-타이포그래피)
9. [접근성](#9-접근성)
10. [우선순위별 개선 로드맵](#10-우선순위별-개선-로드맵)

---

## 1. 디자인 철학 및 방향성

### 핵심 원칙

| 영역 | 최우선 가치 | 디자인 방향 |
|------|-------------|-------------|
| **고객 페이지** | 고객 경험 (CX) | 화려하고 동적인 시각 요소, 부드러운 전환 효과, 감성적 인터랙션 |
| **관리자 페이지** | 가독성 & 사용 편의성 | 깔끔하고 기능적인 UI, 명확한 정보 계층, 빠른 작업 처리 |

### 고객 페이지 디자인 키워드
- ✨ **Delightful** - 사용할 때 즐거움을 주는 인터랙션
- 🎭 **Expressive** - 브랜드 감성을 전달하는 시각 요소
- 🌊 **Fluid** - 부드럽고 자연스러운 전환 효과
- 📱 **Mobile-first** - 모바일에서 최적화된 터치 인터랙션

### 관리자 페이지 디자인 키워드
- 📊 **Functional** - 기능 중심의 실용적 인터페이스
- 👁️ **Scannable** - 빠르게 정보를 파악할 수 있는 레이아웃
- ⚡ **Efficient** - 최소 클릭으로 작업 완료
- 🎯 **Focused** - 불필요한 장식 배제, 핵심 데이터 강조

---

## 2. 종합 요약

### 현재 점수

| 영역 | 고객 페이지 | 관리자 페이지 |
|------|-------------|---------------|
| 시각적 매력도 | 70/100 ⚠️ | 75/100 ✅ |
| 인터랙션/애니메이션 | 65/100 ⚠️ | 80/100 ✅ |
| 가독성 | 85/100 ✅ | 80/100 ✅ |
| 사용 편의성 | 80/100 ✅ | 75/100 ⚠️ |
| 브랜드 일관성 | 75/100 ⚠️ | 70/100 ⚠️ |

### 주요 개선 필요 사항

**고객 페이지**
- ⚠️ 동적 요소 및 애니메이션 부족 → **화려함 강화 필요**
- ⚠️ 페이지 전환 효과 없음 → **부드러운 전환 추가**
- ⚠️ 마이크로 인터랙션 부족 → **디테일한 피드백 추가**
- ⚠️ 히어로 섹션 밋밋함 → **브랜드 감성 강화**

**관리자 페이지**
- ⚠️ 데이터 밀도 높음 → **정보 계층화 개선**
- ⚠️ 필터 UI 복잡 → **간소화 및 접근성 개선**
- ⚠️ 상태 구분 약함 → **색상/아이콘 명확화**

---

## 3. 추천 외부 라이브러리

### 현재 설치된 라이브러리
```json
{
  "framer-motion": "^11.3.0",    // ✅ 애니메이션 (활용 확대 필요)
  "swiper": "^11.1.4",           // ✅ 캐러셀
  "vaul": "^0.9.0",              // ✅ 모바일 드로어
  "react-confetti": "^6.1.0"     // ✅ 축하 효과
}
```

### 🌟 고객 페이지용 추천 라이브러리

#### 1. Lottie (마이크로 애니메이션) - **강력 추천**
```bash
npm install lottie-react
```
**용도**: 로딩, 성공/실패 피드백, 빈 상태, 축하 효과
**장점**: After Effects 애니메이션을 JSON으로 재생, 가볍고 부드러움

```tsx
import Lottie from 'lottie-react';
import successAnimation from '@/public/animations/success.json';

// 체크인 완료 시
<Lottie 
  animationData={successAnimation} 
  loop={false}
  style={{ width: 120, height: 120 }}
/>
```

**무료 Lottie 애니메이션 리소스**:
- [LottieFiles](https://lottiefiles.com/) - 무료/유료 애니메이션
- [IconScout Lottie](https://iconscout.com/lottie-animations) - 고품질 무료

---

#### 2. @formkit/auto-animate (자동 리스트 애니메이션) - **강력 추천**
```bash
npm install @formkit/auto-animate
```
**용도**: 목록 추가/삭제/정렬 시 자동 애니메이션
**장점**: 한 줄 코드로 모든 리스트에 애니메이션 적용

```tsx
import { useAutoAnimate } from '@formkit/auto-animate/react';

function OrderList() {
  const [parent] = useAutoAnimate();
  
  return (
    <ul ref={parent}>
      {orders.map(order => <OrderItem key={order.id} />)}
    </ul>
  );
}
```

---

#### 3. react-spring (물리 기반 애니메이션)
```bash
npm install @react-spring/web
```
**용도**: 자연스러운 바운스, 스프링 효과
**장점**: 물리 법칙 기반으로 자연스러운 움직임

```tsx
import { useSpring, animated } from '@react-spring/web';

function BouncingCard() {
  const [springs, api] = useSpring(() => ({
    from: { scale: 1 },
  }));

  return (
    <animated.div
      style={springs}
      onMouseEnter={() => api.start({ scale: 1.05 })}
      onMouseLeave={() => api.start({ scale: 1 })}
    >
      <Card>...</Card>
    </animated.div>
  );
}
```

---

#### 4. react-intersection-observer (스크롤 기반 애니메이션)
```bash
npm install react-intersection-observer
```
**용도**: 스크롤 시 요소 진입 애니메이션
**장점**: Framer Motion과 결합하여 스크롤 애니메이션 구현

```tsx
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

function AnimatedSection({ children }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

---

#### 5. react-countup (숫자 카운트업)
```bash
npm install react-countup
```
**용도**: KPI 숫자, 통계 표시 시 카운트업 효과
**장점**: 숫자가 올라가는 시각적 임팩트

```tsx
import CountUp from 'react-countup';

// WiFi 연결 성공 시
<CountUp end={100} suffix="%" duration={1.5} />

// 주문 완료 시
<span>주문번호 #<CountUp end={orderNumber} duration={0.8} /></span>
```

---

#### 6. react-parallax-tilt (3D 틸트 효과)
```bash
npm install react-parallax-tilt
```
**용도**: 카드 호버 시 3D 기울기 효과
**장점**: 프리미엄 느낌의 인터랙션

```tsx
import Tilt from 'react-parallax-tilt';

<Tilt
  tiltMaxAngleX={10}
  tiltMaxAngleY={10}
  glareEnable={true}
  glareMaxOpacity={0.2}
  scale={1.02}
>
  <Card className="bg-gradient-to-br from-brand-cream/20 to-white">
    <WifiCard />
  </Card>
</Tilt>
```

---

#### 7. sonner (프리미엄 토스트)
```bash
npm install sonner
```
**용도**: 알림 토스트 (기존 shadcn toast 대체/보완)
**장점**: 더 세련된 디자인, 스와이프 dismiss

```tsx
import { toast, Toaster } from 'sonner';

// 성공 토스트
toast.success('체크인이 완료되었습니다!', {
  description: '즐거운 시간 되세요 🏕️',
  duration: 3000,
});

// 프로미스 토스트 (로딩 → 성공/실패)
toast.promise(submitOrder(), {
  loading: '주문 처리 중...',
  success: '주문이 완료되었습니다!',
  error: '주문에 실패했습니다.',
});
```

---

#### 8. react-rewards (축하 효과) - react-confetti 보완
```bash
npm install react-rewards
```
**용도**: 컨페티, 이모지, 별 효과
**장점**: 특정 요소 기준 발사, 다양한 효과

```tsx
import { useReward } from 'react-rewards';

function CheckInButton() {
  const { reward, isAnimating } = useReward('checkInReward', 'confetti', {
    lifetime: 200,
    spread: 60,
  });

  return (
    <Button onClick={() => { handleCheckIn(); reward(); }} disabled={isAnimating}>
      <span id="checkInReward">체크인 완료</span>
    </Button>
  );
}
```

---

#### 9. embla-carousel-react (가벼운 캐러셀)
```bash
npm install embla-carousel-react
```
**용도**: Swiper 대안, 더 가벼운 캐러셀
**장점**: 번들 크기 작음, 터치 제스처 우수

```tsx
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

function HeroCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  
  return (
    <div ref={emblaRef} className="overflow-hidden">
      <div className="flex">
        {slides.map(slide => <Slide key={slide.id} />)}
      </div>
    </div>
  );
}
```

---

### 📊 관리자 페이지용 추천 라이브러리

#### 1. react-loading-skeleton (스켈레톤 로딩)
```bash
npm install react-loading-skeleton
```
**용도**: 데이터 로딩 시 스켈레톤 UI
**장점**: 일관된 스켈레톤 스타일, 커스터마이징 용이

```tsx
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function ReservationCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton width={120} height={20} />
        <Skeleton width={80} height={16} />
      </CardHeader>
      <CardContent>
        <Skeleton count={2} />
      </CardContent>
    </Card>
  );
}
```

---

#### 2. @tanstack/react-table (데이터 테이블)
```bash
npm install @tanstack/react-table
```
**용도**: 예약/주문 목록 테이블 뷰
**장점**: 정렬, 필터, 페이지네이션 내장

---

#### 3. cmdk (커맨드 팔레트)
```bash
npm install cmdk
```
**용도**: 빠른 검색/명령 실행 (Cmd+K)
**장점**: 관리자 생산성 향상

```tsx
import { Command } from 'cmdk';

<Command>
  <Command.Input placeholder="예약 검색, 명령 실행..." />
  <Command.List>
    <Command.Group heading="최근 검색">
      <Command.Item>홍길동 예약</Command.Item>
    </Command.Group>
    <Command.Group heading="빠른 실행">
      <Command.Item>오늘 체크인 보기</Command.Item>
      <Command.Item>미배정 예약 보기</Command.Item>
    </Command.Group>
  </Command.List>
</Command>
```

---

### 라이브러리 설치 명령어 (전체)

```bash
# 고객 페이지 핵심 (강력 추천)
npm install lottie-react @formkit/auto-animate sonner react-intersection-observer

# 고객 페이지 선택
npm install react-countup react-parallax-tilt react-rewards @react-spring/web

# 관리자 페이지 핵심
npm install react-loading-skeleton cmdk

# 전체 설치
npm install lottie-react @formkit/auto-animate sonner react-intersection-observer react-countup react-parallax-tilt react-rewards react-loading-skeleton cmdk
```

---

## 4. 고객 페이지 개선안

### 4.1 페이지 전환 애니메이션

#### 현재 문제
- 페이지 간 전환이 즉각적이고 끊김
- 사용자 경험이 단절됨

#### 개선안: 페이지 템플릿 애니메이션

```tsx
// app/guest/[token]/template.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.98 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuad
    }
  },
  exit: { 
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  }
};

export default function GuestTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

### 4.2 히어로 섹션 강화

#### 현재 문제
- 환영 메시지만 있고 시각적 임팩트 부족
- 브랜드 감성 전달 미흡

#### 개선안: 동적 히어로 섹션

```tsx
// components/guest/HeroSection.tsx
'use client';

import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { useInView } from 'react-intersection-observer';

export function HeroSection({ guestName }: { guestName: string }) {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <Tilt
      tiltMaxAngleX={5}
      tiltMaxAngleY={5}
      glareEnable={true}
      glareMaxOpacity={0.1}
      glarePosition="all"
    >
      <motion.section
        ref={ref}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-cream/40 via-white to-background-accent p-8 text-center shadow-soft-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* 배경 장식 요소 */}
        <motion.div
          className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-brand-cream/30 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-brand-cream-dark/20 blur-2xl"
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />

        {/* 메인 콘텐츠 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.span 
            className="text-sm font-medium text-brand-dark-muted"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            OUSCARAVAN에 오신 것을 환영합니다
          </motion.span>
          
          <motion.h1 
            className="mt-2 text-2xl font-bold text-brand-dark"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            안녕하세요, <span className="text-brand-cream-deep">{guestName}</span>님!
          </motion.h1>
          
          <motion.p
            className="mt-2 text-sm text-brand-dark-muted"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
          >
            편안한 휴식이 되시길 바랍니다 ✨
          </motion.p>
        </motion.div>
      </motion.section>
    </Tilt>
  );
}
```

---

### 4.3 퀵 액션 그리드 애니메이션

#### 개선안: 스태거 애니메이션 + 터치 피드백

```tsx
// components/guest/QuickActionGrid.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Flame, Coffee, HelpCircle } from 'lucide-react';

const actions = [
  { icon: BookOpen, label: '이용 안내', href: 'guide', color: 'bg-blue-50 text-blue-600' },
  { icon: Flame, label: 'BBQ 주문', href: 'order', color: 'bg-orange-50 text-orange-600' },
  { icon: Coffee, label: '카페 메뉴', href: 'cafe', color: 'bg-amber-50 text-amber-700' },
  { icon: HelpCircle, label: '도움 요청', href: 'help', color: 'bg-green-50 text-green-600' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export function QuickActionGrid({ token }: { token: string }) {
  return (
    <motion.div
      className="grid grid-cols-4 gap-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <motion.div key={action.href} variants={itemVariants}>
            <Link href={`/guest/${token}/${action.href}`}>
              <motion.div
                className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-soft-sm border border-brand-cream-dark/20"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className={`rounded-xl p-3 ${action.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold text-brand-dark">
                  {action.label}
                </span>
              </motion.div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
```

---

### 4.4 카드 스크롤 애니메이션

#### 개선안: 스크롤 진입 시 순차 애니메이션

```tsx
// components/guest/AnimatedCard.tsx
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card } from '@/components/ui/card';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedCard({ children, delay = 0, className }: AnimatedCardProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        delay,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      <Card className={className}>
        {children}
      </Card>
    </motion.div>
  );
}
```

---

### 4.5 체크인/체크아웃 성공 피드백

#### 개선안: Lottie + Confetti 조합

```tsx
// components/guest/CheckInSuccess.tsx
'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { useReward } from 'react-rewards';
import { motion, AnimatePresence } from 'framer-motion';

// Lottie 애니메이션 JSON (LottieFiles에서 다운로드)
import successAnimation from '@/public/animations/check-success.json';

export function CheckInSuccessModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  const { reward } = useReward('successConfetti', 'confetti', {
    lifetime: 300,
    elementCount: 100,
    spread: 90,
  });

  useEffect(() => {
    if (show) {
      setTimeout(reward, 500); // Lottie 재생 후 컨페티
    }
  }, [show, reward]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative rounded-3xl bg-white p-8 text-center shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <span id="successConfetti" className="absolute top-1/2 left-1/2" />
            
            <Lottie
              animationData={successAnimation}
              loop={false}
              style={{ width: 150, height: 150, margin: '0 auto' }}
            />
            
            <motion.h2
              className="mt-4 text-xl font-bold text-brand-dark"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              체크인 완료! 🎉
            </motion.h2>
            
            <motion.p
              className="mt-2 text-sm text-brand-dark-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              즐거운 시간 되세요!
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

### 4.6 바텀 네비게이션 개선

#### 개선안: 활성 탭 인디케이터 + 터치 피드백

```tsx
// components/guest/GuestBottomNav.tsx (개선)
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Flame, Coffee, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '', label: '홈', icon: Home },
  { href: '/guide', label: '안내', icon: BookOpen },
  { href: '/order', label: 'BBQ', icon: Flame },
  { href: '/cafe', label: '카페', icon: Coffee },
  { href: '/help', label: '도움말', icon: HelpCircle },
];

export function GuestBottomNav({ token }: { token: string }) {
  const pathname = usePathname();
  const basePath = `/guest/${token}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-cream-dark/20 bg-white/80 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive = pathname === href || 
            (item.href === '' && pathname === basePath);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={href} className="relative">
              <motion.div
                className={cn(
                  "flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-colors",
                  isActive 
                    ? "text-brand-dark" 
                    : "text-brand-dark-faint"
                )}
                whileTap={{ scale: 0.9 }}
              >
                {/* 활성 배경 인디케이터 */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-brand-cream/40"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="relative z-10"
                >
                  <Icon 
                    className="h-5 w-5" 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                </motion.div>
                
                <span className={cn(
                  "text-[10px] relative z-10",
                  isActive ? "font-bold" : "font-medium"
                )}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

---

### 4.7 WiFi 카드 개선

#### 개선안: 복사 성공 시 마이크로 인터랙션

```tsx
// 복사 성공 시 피드백 강화
import { toast } from 'sonner';
import { useReward } from 'react-rewards';
import { motion, AnimatePresence } from 'framer-motion';

const { reward } = useReward('wifiCopyReward', 'emoji', {
  emoji: ['📶', '✨', '👍'],
  lifetime: 150,
});

const copyPassword = async () => {
  await navigator.clipboard.writeText(WIFI_INFO.password);
  reward();
  toast.success('복사 완료!', {
    description: 'WiFi 설정에서 비밀번호를 붙여넣으세요',
    icon: '📶',
  });
};

// 버튼
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  onClick={copyPassword}
>
  <span id="wifiCopyReward">비밀번호 복사</span>
</motion.button>
```

---

## 5. 관리자 페이지 개선안

### 5.1 디자인 원칙

관리자 페이지는 **화려함보다 명확함**이 중요합니다.

| 요소 | 방향 |
|------|------|
| 애니메이션 | 최소화 (0.15~0.2초 이내) |
| 색상 | 상태 구분에만 사용 |
| 그림자 | 계층 구분에만 사용 |
| 호버 효과 | 미세한 배경색 변화 |

---

### 5.2 KPI 카드 개선

#### 현재 문제
- 숫자 변화 시 시각적 피드백 없음
- 클릭 가능 여부 불명확

#### 개선안: 간결한 호버 + 숫자 카운트

```tsx
// components/admin/AdminKpiCards.tsx (개선)
import CountUp from 'react-countup';

function KpiCard({ title, value, hint, onClick }: KpiCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-150",
        onClick && "cursor-pointer hover:bg-muted/50 hover:border-brand-cream-dark/60"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black tracking-tight">
          <CountUp 
            end={value} 
            duration={0.8} 
            preserveValue 
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
          {hint}
          {onClick && <ChevronRight className="h-3 w-3" />}
        </p>
      </CardContent>
    </Card>
  );
}
```

---

### 5.3 예약 목록 리스트 애니메이션

#### 개선안: @formkit/auto-animate 적용

```tsx
// 리스트 컴포넌트
import { useAutoAnimate } from '@formkit/auto-animate/react';

function ReservationList({ reservations }: { reservations: Reservation[] }) {
  const [parent] = useAutoAnimate({ duration: 150 }); // 빠른 애니메이션

  return (
    <div ref={parent} className="space-y-3">
      {reservations.map(reservation => (
        <ReservationCard key={reservation.id} data={reservation} />
      ))}
    </div>
  );
}
```

---

### 5.4 필터 UI 간소화

#### 개선안: 모바일에서 시트로 변경

```tsx
// 모바일: 필터 버튼 → 바텀시트
// 데스크톱: 인라인 필터

<div className="flex items-center gap-2">
  {/* 모바일: 시트 트리거 */}
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" size="sm" className="md:hidden">
        <Filter className="h-4 w-4 mr-2" />
        필터
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {activeFilterCount}
          </Badge>
        )}
      </Button>
    </SheetTrigger>
    <SheetContent side="bottom" className="h-auto max-h-[70vh]">
      <SheetHeader>
        <SheetTitle>필터</SheetTitle>
      </SheetHeader>
      <FilterContent />
    </SheetContent>
  </Sheet>

  {/* 데스크톱: 인라인 */}
  <div className="hidden md:flex items-center gap-2">
    <FilterContent inline />
  </div>
</div>
```

---

### 5.5 상태 뱃지 명확화

#### 개선안: 색상 + 아이콘 조합

```tsx
// components/admin/StatusBadge.tsx
import { Clock, Loader2, CheckCircle, XCircle, Home, LogIn, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG = {
  pending: { 
    label: '대기', 
    icon: Clock, 
    className: 'bg-amber-100 text-amber-800 border-amber-200' 
  },
  confirmed: { 
    label: '확정', 
    icon: CheckCircle, 
    className: 'bg-blue-100 text-blue-800 border-blue-200' 
  },
  checked_in: { 
    label: '체크인', 
    icon: LogIn, 
    className: 'bg-green-100 text-green-800 border-green-200' 
  },
  checked_out: { 
    label: '체크아웃', 
    icon: LogOut, 
    className: 'bg-gray-100 text-gray-800 border-gray-200' 
  },
  cancelled: { 
    label: '취소', 
    icon: XCircle, 
    className: 'bg-red-100 text-red-800 border-red-200' 
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1", config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
```

---

### 5.6 스켈레톤 로딩 통일

#### 개선안: react-loading-skeleton 적용

```tsx
// components/admin/skeletons.tsx
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton width={80} height={14} />
          </CardHeader>
          <CardContent>
            <Skeleton width={60} height={32} />
            <Skeleton width={100} height={12} className="mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ReservationListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <Skeleton width={100} height={18} />
              <Skeleton width={60} height={22} borderRadius={9999} />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton count={2} height={14} className="mt-1" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

### 5.7 커맨드 팔레트 (생산성 향상)

#### 개선안: Cmd+K 빠른 검색

```tsx
// components/admin/CommandPalette.tsx
'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Home, ShoppingCart, Bell } from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      className="fixed inset-0 z-50"
    >
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-lg">
        <div className="bg-white rounded-xl shadow-2xl border overflow-hidden">
          <Command.Input
            placeholder="검색 또는 명령 입력..."
            className="w-full px-4 py-3 border-b outline-none"
          />
          <Command.List className="max-h-80 overflow-auto p-2">
            <Command.Empty className="p-4 text-center text-muted-foreground">
              결과 없음
            </Command.Empty>
            
            <Command.Group heading="빠른 이동">
              <Command.Item onSelect={() => { router.push('/admin'); setOpen(false); }}>
                <Home className="mr-2 h-4 w-4" /> 대시보드
              </Command.Item>
              <Command.Item onSelect={() => { router.push('/admin/reservations'); setOpen(false); }}>
                <Calendar className="mr-2 h-4 w-4" /> 예약 관리
              </Command.Item>
              <Command.Item onSelect={() => { router.push('/admin/orders'); setOpen(false); }}>
                <ShoppingCart className="mr-2 h-4 w-4" /> 주문 관리
              </Command.Item>
            </Command.Group>

            <Command.Group heading="빠른 필터">
              <Command.Item onSelect={() => { router.push('/admin/reservations?filter=d1-unassigned'); setOpen(false); }}>
                내일 미배정 예약 보기
              </Command.Item>
              <Command.Item onSelect={() => { router.push('/admin/orders?status=pending'); setOpen(false); }}>
                대기 중인 주문 보기
              </Command.Item>
            </Command.Group>
          </Command.List>
        </div>
      </div>
    </Command.Dialog>
  );
}
```

---

## 6. 공통 컴포넌트 개선

### 6.1 토스트 시스템 업그레이드

#### 개선안: Sonner 적용

```tsx
// app/layout.tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid rgba(196, 184, 150, 0.3)',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  );
}

// 사용 예시
import { toast } from 'sonner';

// 고객 페이지: 풍부한 피드백
toast.success('주문이 완료되었습니다!', {
  description: '곧 준비해 드릴게요 🔥',
  duration: 4000,
});

// 관리자 페이지: 간결한 피드백
toast.success('저장되었습니다');
```

---

### 6.2 빈 상태 컴포넌트

```tsx
// components/shared/EmptyState.tsx
import Lottie from 'lottie-react';
import emptyAnimation from '@/public/animations/empty-box.json';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'minimal'; // 고객용 / 관리자용
}

export function EmptyState({ title, description, action, variant = 'default' }: EmptyStateProps) {
  if (variant === 'minimal') {
    // 관리자용: 간결한 스타일
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 rounded-full bg-muted p-3">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  }

  // 고객용: Lottie 애니메이션
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Lottie
        animationData={emptyAnimation}
        loop
        style={{ width: 150, height: 150 }}
      />
      <h3 className="mt-4 text-lg font-semibold text-brand-dark">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-brand-dark-muted max-w-xs">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
```

---

## 7. 색상 및 테마 시스템

### 현재 상태 (유지)

라이트 모드만 지원하며, 현재 브랜드 색상 시스템을 유지합니다.

```
브랜드 색상:
├── brand-dark: #1A1714 (주 텍스트)
├── brand-cream: #E8DCC8 (시그니처)
├── brand-cream-dark: #C4B896 (테두리)
└── brand-cream-deep: #A89F8A (포인트)
```

### 고객 vs 관리자 색상 활용 차이

| 요소 | 고객 페이지 | 관리자 페이지 |
|------|-------------|---------------|
| 배경 그라데이션 | O (brand-cream 활용) | X |
| 카드 배경 변화 | O (호버 시 그라데이션) | X (단색 유지) |
| 아이콘 배경색 | O (컬러풀) | 필요 시만 |
| 상태 색상 | 최소 사용 | 적극 사용 |

---

## 8. 타이포그래피

### 고객 페이지
- 제목: `font-bold` ~ `font-black`
- 감성적 문구 활용 (예: "편안한 휴식 되세요 ✨")
- 이모지 적극 활용

### 관리자 페이지
- 제목: `font-semibold` ~ `font-bold`
- 간결하고 명확한 레이블
- 이모지 최소화

---

## 9. 접근성

### 공통 체크리스트

- [ ] 모든 이미지에 alt 텍스트
- [ ] 모든 폼 요소에 label 연결
- [ ] 모든 버튼에 aria-label (아이콘 버튼)
- [ ] 색상 대비 4.5:1 이상
- [ ] 키보드 탭 순서 논리적
- [ ] 포커스 링 가시성 확보
- [ ] 모션 감소 설정 지원 (`prefers-reduced-motion`)

### 모션 감소 대응

```tsx
// 고객 페이지 애니메이션에 적용
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={{ y: shouldReduceMotion ? 0 : [0, -10, 0] }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
    >
      {/* 콘텐츠 */}
    </motion.div>
  );
}
```

---

## 10. 우선순위별 개선 로드맵

### Phase 1: 라이브러리 설치 및 기반 구축 (1-2일)

```bash
npm install lottie-react @formkit/auto-animate sonner react-intersection-observer react-loading-skeleton
```

| 작업 | 대상 | 영향도 |
|------|------|--------|
| Sonner 토스트 적용 | 공통 | 높음 |
| 스켈레톤 로딩 통일 | 관리자 | 중간 |
| auto-animate 리스트 적용 | 양쪽 | 중간 |

### Phase 2: 고객 페이지 동적 요소 (3-5일)

| 작업 | 설명 | 영향도 |
|------|------|--------|
| 페이지 전환 애니메이션 | template.tsx | 높음 |
| 히어로 섹션 개선 | 그라데이션 + 애니메이션 | 높음 |
| 퀵 액션 스태거 애니메이션 | 순차 등장 | 중간 |
| 바텀 네비 활성 인디케이터 | layoutId 애니메이션 | 중간 |
| 카드 스크롤 애니메이션 | 진입 시 fade-up | 중간 |

### Phase 3: 고객 페이지 마이크로 인터랙션 (3-5일)

| 작업 | 설명 | 영향도 |
|------|------|--------|
| 체크인 성공 모달 | Lottie + Confetti | 높음 |
| WiFi 복사 피드백 | react-rewards | 중간 |
| 주문 완료 피드백 | Lottie 애니메이션 | 중간 |
| 카드 틸트 효과 | react-parallax-tilt | 낮음 |

### Phase 4: 관리자 페이지 개선 (3-5일)

| 작업 | 설명 | 영향도 |
|------|------|--------|
| 필터 UI 시트 전환 | 모바일 UX | 높음 |
| 상태 뱃지 아이콘 추가 | 명확성 | 중간 |
| 커맨드 팔레트 | 생산성 | 중간 |
| KPI 카운트업 | react-countup | 낮음 |

### Phase 5: 선택적 개선

| 작업 | 설명 | 난이도 |
|------|------|--------|
| Lottie 빈 상태 | 검색 결과 없음 등 | 중간 |
| 스프링 애니메이션 | react-spring 고급 효과 | 높음 |
| 제스처 인터랙션 | 스와이프 삭제 등 | 높음 |

---

## 부록: Lottie 애니메이션 추천

### 무료 다운로드 사이트
1. **[LottieFiles](https://lottiefiles.com/featured)** - 가장 큰 무료 라이브러리
2. **[IconScout](https://iconscout.com/lottie-animations)** - 고품질 무료
3. **[Lordicon](https://lordicon.com/)** - 아이콘 스타일 애니메이션

### 추천 애니메이션 (검색 키워드)
- 체크인 성공: `success check`, `celebration`
- 로딩: `loading dots`, `spinner`
- 빈 상태: `empty box`, `no data`, `search empty`
- 에러: `error`, `warning`
- WiFi: `wifi`, `connection`
- 환영: `welcome`, `greeting`

---

**문서 버전**: 2.0  
**최종 업데이트**: 2026-01-24
