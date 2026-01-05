# OUSCARAVAN Smart Concierge Web App
## 프로젝트 기획 문서

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [핵심 목표 및 가치](#2-핵심-목표-및-가치)
3. [기술 스택](#3-기술-스택)
4. [디자인 시스템](#4-디자인-시스템)
5. [UX 아키텍처](#5-ux-아키텍처)
6. [상세 기능 명세](#6-상세-기능-명세)
7. [데이터 구조 및 API 설계](#7-데이터-구조-및-api-설계)
8. [개발 가이드라인](#8-개발-가이드라인)
9. [배포 및 운영 전략](#9-배포-및-운영-전략)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 정보

- **프로젝트명**: OUSCARAVAN Smart Concierge Web App
- **타입**: Mobile-First PWA (Progressive Web App)
- **브랜드 아이덴티티**: "Modern Minimal Luxury" & "Sunset Relax"
- **주요 플랫폼**: 모바일 웹 (95%), 데스크톱 (5%)

### 1.2 프로젝트 배경

OUSCARAVAN은 게스트에게 프리미엄 호스피탈리티 경험을 제공하는 캠핑장/글램핑 시설입니다. 기존의 반복적인 구두 안내 업무를 디지털화하고, 게스트의 편의성을 극대화하며, F&B 매출 증대를 목표로 합니다.

### 1.3 시스템 통합 전략

#### 현재 단계 (Phase 1)
- 독립형 웹 앱으로 운영
- URL 쿼리 파라미터 기반 게스트 식별
- 정적 데이터 기반 컨시어지 서비스 제공

#### 향후 단계 (Phase 2)
- **n8n 워크플로우 통합**
- 네이버 예약 → n8n 데이터 캡처 → 카카오톡 메시지 발송 → 고유 링크 제공
- 자동 체크인/체크아웃 처리
- 불멍/바베큐 주문 자동화
- 실시간 재고 관리 및 알림

#### 시나리오 플로우
```
[게스트 예약] 
  → 네이버 예약 시스템
  → n8n 워크플로우 트리거
  → 게스트 정보 추출 및 저장
  → 카카오톡 메시지 발송 (고유 링크 포함)
  → 게스트가 링크 클릭
  → OUSCARAVAN 앱 접속 (자동 로그인)
  → 컨시어지 서비스 이용
```

---

## 2. 핵심 목표 및 가치

### 2.1 관리자 업무 최소화/자동화

#### 목표
- **반복적인 구두 안내 제거**: WiFi 비밀번호, BBQ 사용법, 난방기 조작법 등
- **체크인/체크아웃 자동화**: 수동 확인 및 키 전달 프로세스 제거
- **주문 프로세스 자동화**: 불멍/바베큐 주문의 디지털화 및 재고 관리
- **24/7 자동 응답**: 기본적인 문의에 대한 즉각적인 답변 제공

#### 구체적 효과
- **시간 절감**: 게스트당 평균 15분 → 3분 (80% 감소)
- **인력 효율화**: 프론트 데스크 업무량 70% 감소
- **오류 감소**: 수기 기록 및 전달 과정에서 발생하는 실수 방지

### 2.2 게스트 경험 향상

- **즉각적인 정보 접근**: 언제 어디서나 필요한 정보 확인
- **프리미엄 경험**: 현대적이고 세련된 UI/UX
- **개인화된 서비스**: 게스트 이름 및 객실 정보 기반 맞춤 안내

### 2.3 매출 증대

- **F&B 매출 증대**: 카페 쿠폰 및 메뉴 노출을 통한 유도
- **부가 서비스 판매**: 불멍/바베큐 세트 주문 자동화
- **재방문 유도**: 편리한 경험을 통한 고객 만족도 향상

---

## 3. 기술 스택

### 3.1 Core Framework

- **Next.js 14+** (App Router)
  - 서버 사이드 렌더링 및 정적 생성
  - 최적화된 이미지 및 라우팅
  - API Routes (향후 n8n 웹훅 연동용)

- **TypeScript** (Strict Mode)
  - 타입 안정성 보장
  - 개발 생산성 향상

### 3.2 스타일링

- **Tailwind CSS**
  - 유틸리티 퍼스트 접근
  - 반응형 디자인 구현
  - 커스텀 디자인 시스템 구축

### 3.3 상태 관리

- **Zustand**
  - 경량 상태 관리 라이브러리
  - 게스트 정보, 객실 정보, 주문 상태 등 전역 상태 관리

### 3.4 UI 컴포넌트

- **Shadcn UI**
  - Base Components: Accordion, Dialog, Sheet, Tabs, Toast, Button, Card
  - 접근성 및 사용성 최적화
  - 커스터마이징 가능한 디자인 시스템

### 3.5 차별화 라이브러리

#### 애니메이션
- **Framer Motion**
  - 페이지 전환 애니메이션
  - 모달 팝업 애니메이션
  - 쿠폰 플립 애니메이션 (3D 효과)
  - 스크롤 기반 애니메이션

#### 모바일 UX
- **Vaul** (Drawer)
  - 네이티브 모바일 앱과 유사한 바텀 시트 경험
  - WiFi QR 코드 표시
  - 상세 정보 모달

#### 캐러셀
- **Swiper.js** 또는 **Embla Carousel**
  - BBQ 가이드 단계별 슬라이드
  - 마켓 메뉴 가로 스크롤
  - 터치 제스처 최적화

#### 특수 효과
- **React-Confetti**
  - WiFi 연결 성공 시 축하 효과
  - 쿠폰 활성화 시 축하 효과

#### 아이콘
- **Lucide React**
  - 일관된 아이콘 시스템
  - 경량 및 커스터마이징 가능

#### QR 코드
- **qrcode.react**
  - WiFi QR 코드 동적 생성
  - 쿠폰 QR 코드 생성 (향후)

### 3.6 추가 라이브러리 (향후 확장)

- **React Hook Form**: 폼 관리 및 유효성 검사
- **Zod**: 스키마 검증
- **Date-fns**: 날짜/시간 처리
- **Axios**: HTTP 클라이언트 (n8n 웹훅 연동용)

---

## 4. 디자인 시스템

### 4.1 컬러 팔레트

#### 배경 (Canvas)
- **Off-White**: `#FAFAFA`
- **사용처**: 전체 배경, 카드 배경
- **이유**: 순수 흰색보다 부드럽고 프리미엄한 느낌

#### 주요 텍스트 및 UI 테두리
- **Deep Dark Brown**: `#221E1D`
- **사용처**: 모든 주요 타이포그래피, 컴포넌트 아웃라인
- **이유**: 순수 검정(`#000`)보다 부드럽고 고급스러운 대안

#### 악센트 (Sunset Point)
- **Sunset Orange**: `#FF7E5F`
- **Gradient**: `#FF7E5F` → `#2C3E50`
- **사용처**: CTA 버튼, 활성 상태, 강조 요소
- **이유**: 일몰 분위기를 연상시키는 따뜻한 색상

#### 보조 색상
- **Success Green**: `#10B981` (성공 메시지)
- **Warning Yellow**: `#F59E0B` (경고 메시지)
- **Error Red**: `#EF4444` (에러 메시지)
- **Info Blue**: `#3B82F6` (정보 메시지)

### 4.2 타이포그래피

#### 영어 헤딩
- **폰트**: Montserrat 또는 Playfair Display
- **스타일**: Bold, Elegant
- **트래킹**: `tracking-wide` (고급스러운 느낌 강조)

#### 한글 본문
- **폰트**: Pretendard
- **스타일**: Clean, Legible
- **크기**: 모바일 최소 14px, 데스크톱 16px

#### 타이포그래피 스케일
```css
/* 모바일 */
h1: 28px (Montserrat Bold)
h2: 24px (Montserrat SemiBold)
h3: 20px (Montserrat Medium)
body: 14px (Pretendard Regular)
caption: 12px (Pretendard Regular)

/* 데스크톱 */
h1: 36px
h2: 30px
h3: 24px
body: 16px
caption: 14px
```

### 4.3 간격 시스템

- **Base Unit**: 4px
- **Spacing Scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

### 4.4 그림자 및 효과

- **Card Shadow**: `shadow-sm` (기본 카드)
- **Elevated Shadow**: `shadow-md` (호버/활성 상태)
- **Modal Shadow**: `shadow-xl` (모달/다이얼로그)

### 4.5 이미지 가이드라인

- **비율**: 16:9 (히어로 이미지), 4:3 (가이드 이미지), 1:1 (메뉴 이미지)
- **품질**: WebP 포맷 우선, JPG 폴백
- **최적화**: Next.js Image 컴포넌트 사용

---

## 5. UX 아키텍처

### 5.1 모바일 우선 설계 (Mobile First)

#### 화면 크기 기준
- **Mobile**: < 768px (주요 타겟)
- **Desktop**: >= 768px (보조 타겟)

#### 모바일 네비게이션
- **고정 하단 탭 바** (Fixed Bottom Tab Bar)
  - Home (홈)
  - Guide (가이드)
  - Market (마켓)
  - Help (도움말)
- **Thumb Zone 최적화**: 주요 액션 버튼은 엄지 손가락이 쉽게 닿는 위치에 배치

#### 모바일 인터랙션
- **터치 제스처**: 스와이프, 탭, 롱 프레스
- **레이아웃**: 단일 컬럼, 스택형 카드
- **스크롤**: 부드러운 스크롤, 스크롤 인디케이터

### 5.2 데스크톱 적응형 설계

#### 데스크톱 네비게이션
- **고정 상단 헤더** (Fixed Top Header)
  - 로고 (왼쪽)
  - 메뉴 (오른쪽)
- **하단 탭 바 숨김**: `md:hidden`

#### 데스크톱 레이아웃
- **콘텐츠 제한**: `max-w-md` 중앙 정렬 또는 2컬럼 그리드
- **디지털 브로셔 느낌**: PC에서도 모바일 앱과 유사한 경험 제공
- **호버 효과**: 데스크톱 전용 인터랙션

### 5.3 접근성 (Accessibility)

- **키보드 네비게이션**: 모든 인터랙티브 요소 접근 가능
- **스크린 리더 지원**: ARIA 레이블 및 시맨틱 HTML
- **색상 대비**: WCAG AA 기준 준수
- **터치 타겟 크기**: 최소 44x44px

---

## 6. 상세 기능 명세

### 6.1 Tab 1: HOME (대시보드)

#### 6.1.1 개인화된 환영 메시지

**기능**
- URL 쿼리 파라미터에서 게스트 이름 추출
- 예: `ouscaravan.com?guest=John&room=Airstream1`
- Framer Motion을 사용한 페이드인 애니메이션

**UI**
```
┌─────────────────────────┐
│  [배경 이미지: 일몰]     │
│                         │
│  Welcome, John.         │
│  (페이드인 애니메이션)   │
└─────────────────────────┘
```

**구현 로직**
```typescript
// URL에서 게스트 정보 추출
const searchParams = useSearchParams();
const guestName = searchParams.get('guest') || 'Guest';
const roomNumber = searchParams.get('room') || '';

// Zustand 스토어에 저장
useGuestStore.setState({ 
  name: guestName, 
  room: roomNumber 
});
```

#### 6.1.2 상태 카드 (Status Cards)

**WiFi 카드**
- **표시 정보**: SSID (`OUS_Guest`)
- **주요 액션**: 
  - "비밀번호 복사" 버튼 클릭 → 비밀번호 클립보드 복사 → React-Confetti 효과 → Toast 알림 "비밀번호가 복사되었습니다!"
  - "QR 코드 보기" 버튼 → Vaul Drawer 열기 → 큰 QR 코드 표시
- **디자인**: 깔끔한 카드 레이아웃, WiFi 아이콘

**시간 카드**
- **체크인 시간**: 15:00 (시각적 표현)
- **체크아웃 시간**: 11:00 (시각적 표현)
- **현재 시간 표시**: 실시간 시계 (선택사항)
- **디자인**: 아이콘과 함께 시간 정보 강조

**일몰 위젯**
- **기능**: 오늘의 일몰 시간 표시 (예: "Today's Sunset: 19:24")
- **데이터 소스**: `constants.ts` 또는 API (향후)
- **디자인**: 미니멀한 위젯, 일몰 아이콘

#### 6.1.3 빠른 액세스 (Quick Access)

- **체크인/체크아웃 버튼**: 자동 처리 트리거
- **주문 내역**: 불멍/바베큐 주문 현황 확인
- **알림**: 새로운 메시지 또는 업데이트 알림

### 6.2 Tab 2: GUIDE (디지털 매뉴얼)

#### 6.2.1 검색 및 필터

**검색 바**
- **위치**: 상단 고정 (Sticky)
- **기능**: 실시간 검색 (제목, 내용 검색)
- **디자인**: 검색 아이콘 포함, 둥근 모서리

**카테고리 필터**
- **옵션**: [전체] [실내] [요리] [편의시설] [규칙]
- **UI**: 탭 또는 칩 형태
- **인터랙션**: 클릭 시 해당 카테고리만 필터링

#### 6.2.2 가이드 콘텐츠 (아코디언 스타일)

**난방/에어컨**
- **제목**: "난방/에어컨 사용법"
- **내용**: 
  - 컨트롤러 사진
  - 단계별 설명
  - 권장 온도 설정
- **UI**: 아코디언 (Shadcn Accordion)

**온수**
- **제목**: "온수 사용 안내"
- **경고 메시지**: 
  - ⚠️ **"50L 용량 제한. 샤워 간격 15분 대기 필수"**
  - 강조 스타일: 노란색 배경 또는 빨간색 테두리
- **내용**: 온수 사용 방법, 주의사항

**빔 프로젝터**
- **제목**: "빔 프로젝터 연결 방법"
- **내용**: 
  - HDMI 연결 방법
  - 미러링 방법 (iOS/Android)
  - 문제 해결 가이드

**기타 시설**
- **와이파이**: 연결 방법 (QR 코드 링크)
- **주차**: 주차장 위치 및 규칙
- **쓰레기**: 분리수거 안내

#### 6.2.3 🔥 BBQ & 불멍 가이드 (특수 기능)

**구현 방식**
- **아코디언 내부**: "단계별 가이드 보기" 버튼
- **버튼 클릭**: 전체 화면 Swiper/Embla Carousel 모달 열기

**슬라이드 구성** (6단계)
1. **전원 스트립 켜기**
   - 이미지: 전원 스트립 사진
   - 텍스트: "전원 스트립의 스위치를 ON으로 설정하세요"

2. **가스 레버 확인**
   - 이미지: 가스 레버 사진
   - 텍스트: "가스 탱크의 레버가 열려있는지 확인하세요"

3. **점화**
   - 이미지: 점화 버튼 사진
   - 텍스트: "점화 버튼을 누르고 90도 회전하세요 (주의: 급격한 회전 금지)"

4. **불꽃 조절**
   - 이미지: 불꽃 조절 다이얼 사진
   - 텍스트: "원하는 불꽃 세기로 조절하세요"

5. **즐기기**
   - 이미지: BBQ 장면
   - 텍스트: "안전하게 즐기세요!"

6. **끄기**
   - 이미지: 가스 레버 사진
   - 텍스트: "사용 후 반드시 가스 레버를 잠그세요"

**UI 특징**
- **전체 화면 모달**: 배경 어둡게 처리
- **스와이프 가능**: 좌우 스와이프로 단계 이동
- **인디케이터**: 하단 점 인디케이터
- **닫기 버튼**: 우상단 X 버튼

**왜 이 방식인가?**
- 긴 세로 이미지를 확대/축소하는 것보다 훨씬 나은 UX
- 단계별로 명확한 안내
- 모바일에서 최적화된 경험

### 6.3 Tab 3: MARKET (카페 OUSMARKET 통합)

#### 6.3.1 골든 티켓 (디지털 쿠폰)

**UI 디자인**
- **프리미엄 티켓 느낌**: Deep Brown & Gold 악센트
- **3D 플립 애니메이션**: Framer Motion 사용
- **카드 형태**: 물리적 티켓과 유사한 디자인

**프론트 사이드**
- **메시지**: "OUS 게스트 전용 10% 할인"
- **디자인**: 골드 그라데이션, 우아한 타이포그래피

**백 사이드**
- **메시지**: "이 화면을 직원에게 보여주세요"
- **정보**: 객실 번호 (`{RoomNumber}`)
- **QR 코드**: (향후) 쿠폰 인증용 QR 코드

**인터랙션**
- **클릭/탭**: 카드가 3D로 플립
- **애니메이션**: 부드러운 회전 효과 (0.6초)
- **활성화**: React-Confetti 효과

#### 6.3.2 메뉴 쇼케이스

**구현 방식**
- **가로 스크롤**: Swiper.js 사용
- **카드 형태**: 각 메뉴 아이템별 카드

**시그니처 메뉴**
1. **OUS Latte**
   - 고품질 이미지
   - 설명: "부드러운 라떼"
   - 가격: 표시

2. **Salt Bread**
   - 고품질 이미지
   - 설명: "바삭한 소금빵"
   - 가격: 표시

3. **Ginseng Blended**
   - 고품질 이미지
   - 설명: "건강한 인삼 블렌드"
   - 가격: 표시

**UI 특징**
- **터치 스와이프**: 자연스러운 스크롤
- **이미지 품질**: 고해상도, WebP 포맷
- **호버 효과**: 데스크톱에서 카드 확대

#### 6.3.3 카페 정보

**지도**
- **카페 위치**: 간단한 지도 또는 이미지
- **길 안내**: "길 찾기" 버튼 (외부 지도 앱 연동)

**운영 시간**
- **평일**: 09:00 - 18:00
- **주말**: 09:00 - 19:00
- **휴무일**: **수요일 휴무** (강조 표시)

**연락처**
- **전화**: `tel:` 링크
- **주소**: 복사 가능

### 6.4 Tab 4: HELP (긴급 상황 및 지원)

#### 6.4.1 플로팅 액션 버튼 (FAB)

**위치**: 하단 우측 고정 (모바일만)
- **아이콘**: 전화 아이콘
- **기능**: `tel:010-xxxx-xxxx` 링크
- **디자인**: 원형 버튼, 그림자 효과
- **데스크톱**: 숨김 또는 다른 위치

#### 6.4.2 안전 정보

**소화기 위치**
- **내용**: 소화기 위치 지도
- **이미지**: 시설 레이아웃 이미지
- **텍스트**: 각 위치별 설명

**응급 연락처**
- **119**: 소방서
- **112**: 경찰서
- **응급실**: 가장 가까운 병원 정보
- **약국**: 24시간 약국 정보

**시설 레이아웃**
- **지도**: 전체 시설 지도
- **주요 시설 표시**: 화장실, 샤워실, 주차장 등

#### 6.4.3 FAQ (자주 묻는 질문)

**카테고리**
- 체크인/체크아웃
- 시설 이용
- 주문 및 결제
- 기타

**UI**: 아코디언 스타일

### 6.5 자동 체크인/체크아웃 기능 (핵심 기능)

#### 6.5.1 자동 체크인

**트리거 조건**
- 게스트가 고유 링크 접속
- n8n에서 전송된 링크에 체크인 정보 포함
- 예: `ouscaravan.com?guest=John&room=A1&checkin=2024-01-15&checkout=2024-01-17`

**프로세스**
1. **링크 접속**: 게스트가 카카오톡 링크 클릭
2. **정보 추출**: URL 파라미터에서 체크인 정보 파싱
3. **자동 처리**:
   - 체크인 시간 기록 (n8n 웹훅 전송)
   - 환영 메시지 표시
   - 객실 정보 자동 설정
   - WiFi 비밀번호 자동 제공
4. **알림**: 관리자에게 체크인 완료 알림 (n8n)

**UI**
- **체크인 완료 배지**: "체크인 완료" 표시
- **체크인 시간**: 자동 기록된 시간 표시
- **다음 단계 안내**: "WiFi 연결하기", "가이드 보기" 등

#### 6.5.2 자동 체크아웃

**트리거 조건**
- 체크아웃 시간 1시간 전 알림
- 체크아웃 시간 도달 시 자동 처리
- 또는 게스트가 수동으로 체크아웃 버튼 클릭

**프로세스**
1. **알림**: 체크아웃 1시간 전 푸시 알림 (PWA)
2. **체크아웃 확인**:
   - 체크아웃 체크리스트 표시
   - 예: "가스 레버 잠금 확인", "쓰레기 정리 확인"
3. **자동 처리**:
   - 체크아웃 시간 기록 (n8n 웹훅 전송)
   - 객실 상태 업데이트
   - 감사 메시지 표시
4. **알림**: 관리자에게 체크아웃 완료 알림

**UI**
- **체크아웃 버튼**: HOME 탭에 표시
- **체크리스트 모달**: 체크아웃 전 확인사항
- **완료 화면**: "체크아웃 완료. 다음에 또 만나요!"

### 6.6 불멍/바베큐 주문 자동화 (핵심 기능)

#### 6.6.1 주문 프로세스

**주문 접수**
- **위치**: MARKET 탭 또는 별도 "주문" 섹션
- **메뉴**: 
  - 불멍 세트 (소/중/대)
  - 바베큐 세트 (소/중/대)
  - 개별 아이템 (숯, 그릴, 고기 등)

**주문 폼**
- **선택**: 세트 또는 개별 아이템
- **수량**: +/- 버튼
- **요청사항**: 텍스트 입력 (선택)
- **배송 시간**: 원하는 시간 선택 (예: 18:00)
- **총액**: 실시간 계산

**주문 제출**
- **확인 모달**: 주문 내역 확인
- **제출**: n8n 웹훅으로 주문 데이터 전송
- **확인**: 주문 번호 발급 및 알림

#### 6.6.2 재고 관리 (향후)

**실시간 재고 확인**
- n8n에서 재고 데이터 관리
- 주문 시 재고 확인
- 재고 부족 시 알림

**자동 알림**
- 재고 부족 시 관리자 알림
- 주문 접수 시 관리자 알림
- 배송 준비 완료 시 게스트 알림

#### 6.6.3 주문 내역

**주문 현황**
- **대기 중**: 주문 접수됨
- **준비 중**: 관리자가 준비 중
- **배송 중**: 배송 시작
- **완료**: 배송 완료

**주문 내역 조회**
- HOME 탭에서 "주문 내역" 카드 클릭
- 주문 번호, 시간, 상태 표시

---

## 7. 데이터 구조 및 API 설계

### 7.1 URL 쿼리 파라미터 구조

```typescript
interface GuestParams {
  guest: string;        // 게스트 이름
  room: string;         // 객실 번호 (예: Airstream1)
  checkin?: string;    // 체크인 날짜 (YYYY-MM-DD)
  checkout?: string;   // 체크아웃 날짜 (YYYY-MM-DD)
  token?: string;      // 인증 토큰 (향후 보안 강화용)
}
```

**예시 URL**
```
https://ouscaravan.com?guest=John&room=A1&checkin=2024-01-15&checkout=2024-01-17
```

### 7.2 Zustand 스토어 구조

```typescript
interface GuestStore {
  // 게스트 정보
  name: string;
  room: string;
  checkinDate: string | null;
  checkoutDate: string | null;
  
  // 상태
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  
  // 주문
  orders: Order[];
  
  // 액션
  setGuestInfo: (info: GuestInfo) => void;
  checkIn: () => void;
  checkOut: () => void;
  addOrder: (order: Order) => void;
}

interface Order {
  id: string;
  type: 'bbq' | 'fire';
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'delivering' | 'completed';
  createdAt: string;
  deliveryTime?: string;
}
```

### 7.3 Constants 파일 구조

```typescript
// lib/constants.ts

export const WIFI_INFO = {
  ssid: 'OUS_Guest',
  password: 'OUS2024Guest!',
};

export const CHECK_IN_OUT = {
  checkIn: '15:00',
  checkOut: '11:00',
};

export const SUNSET_TIME = {
  // API 또는 계산 로직으로 업데이트 가능
  today: '19:24',
};

export const GUIDE_DATA = {
  categories: ['전체', '실내', '요리', '편의시설', '규칙'],
  items: [
    {
      id: 'heating',
      category: '실내',
      title: '난방/에어컨 사용법',
      content: '...',
      images: ['...'],
    },
    // ...
  ],
};

export const MENU_ITEMS = [
  {
    id: 'ous-latte',
    name: 'OUS Latte',
    description: '부드러운 라떼',
    price: 5000,
    image: '/images/menu/ous-latte.jpg',
  },
  // ...
];

export const BBQ_SETS = [
  {
    id: 'bbq-small',
    name: '바베큐 세트 (소)',
    price: 30000,
    items: ['숯 1kg', '그릴', '고기 500g'],
  },
  // ...
];
```

### 7.4 n8n 웹훅 API 설계 (향후)

#### 체크인 웹훅
```typescript
POST /api/n8n/checkin
{
  "guest": "John",
  "room": "A1",
  "checkinTime": "2024-01-15T15:00:00Z",
  "source": "web_app"
}
```

#### 체크아웃 웹훅
```typescript
POST /api/n8n/checkout
{
  "guest": "John",
  "room": "A1",
  "checkoutTime": "2024-01-17T11:00:00Z",
  "checklist": {
    "gasLocked": true,
    "trashCleaned": true
  }
}
```

#### 주문 웹훅
```typescript
POST /api/n8n/order
{
  "guest": "John",
  "room": "A1",
  "orderType": "bbq",
  "items": [
    { "id": "bbq-small", "quantity": 1 }
  ],
  "totalAmount": 30000,
  "deliveryTime": "18:00",
  "notes": "문 앞에 놓아주세요"
}
```

---

## 8. 개발 가이드라인

### 8.1 디렉토리 구조

```
ouscaravan-app/
├── app/
│   ├── layout.tsx              # 메인 레이아웃 (반응형 컨테이너)
│   ├── page.tsx                # 리다이렉트 로직 (홈으로)
│   ├── home/
│   │   └── page.tsx            # HOME 탭
│   ├── guide/
│   │   └── page.tsx            # GUIDE 탭
│   ├── market/
│   │   └── page.tsx            # MARKET 탭
│   └── help/
│       └── page.tsx            # HELP 탭
├── components/
│   ├── ui/                     # Shadcn 컴포넌트
│   │   ├── accordion.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   └── toast.tsx
│   ├── shared/                 # 공통 컴포넌트
│   │   ├── BottomNav.tsx       # 하단 네비게이션 (모바일)
│   │   ├── Header.tsx          # 상단 헤더 (데스크톱)
│   │   └── Layout.tsx          # 레이아웃 래퍼
│   └── features/               # 기능별 컴포넌트
│       ├── WifiCard.tsx        # WiFi 카드
│       ├── TimeCard.tsx        # 시간 카드
│       ├── SunsetWidget.tsx    # 일몰 위젯
│       ├── CouponFlip.tsx      # 쿠폰 플립 카드
│       ├── BBQCarousel.tsx     # BBQ 가이드 캐러셀
│       ├── MenuCarousel.tsx    # 메뉴 캐러셀
│       ├── CheckInOut.tsx      # 체크인/체크아웃
│       └── OrderForm.tsx       # 주문 폼
├── lib/
│   ├── store.ts                # Zustand 스토어
│   ├── constants.ts            # 모든 정적 데이터
│   └── utils.ts                # 유틸리티 함수
├── public/
│   ├── images/
│   │   ├── hero/               # 히어로 이미지
│   │   ├── guide/              # 가이드 이미지
│   │   └── menu/               # 메뉴 이미지
│   └── icons/                  # 아이콘
├── styles/
│   └── globals.css             # 전역 스타일
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### 8.2 컴포넌트화 원칙

#### 원칙
1. **단일 책임**: 각 컴포넌트는 하나의 명확한 목적
2. **재사용성**: 공통 로직은 shared 컴포넌트로 분리
3. **복잡한 UI 분리**: CouponFlip, BBQCarousel 등은 별도 컴포넌트

#### 예시: CouponFlip 컴포넌트
```typescript
// components/features/CouponFlip.tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export const CouponFlip = ({ roomNumber }: { roomNumber: string }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <motion.div
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* 프론트/백 사이드 */}
    </motion.div>
  );
};
```

### 8.3 데이터 분리 원칙

**규칙**: 컴포넌트 내부에 텍스트를 하드코딩하지 않음

**나쁜 예**
```typescript
// ❌ 하드코딩
<div>Welcome, Guest</div>
```

**좋은 예**
```typescript
// ✅ constants.ts 사용
import { WELCOME_MESSAGE } from '@/lib/constants';

<div>{WELCOME_MESSAGE.replace('{name}', guestName)}</div>
```

**이유**: 비개발자도 `constants.ts`만 수정하면 텍스트 변경 가능

### 8.4 애니메이션 가이드라인

#### 페이지 전환
```typescript
import { AnimatePresence, motion } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    key={currentTab}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    {content}
  </motion.div>
</AnimatePresence>
```

#### 모달 애니메이션
- **등장**: 페이드인 + 스케일 업
- **퇴장**: 페이드아웃 + 스케일 다운
- **지속 시간**: 0.3초

### 8.5 반응형 디자인 규칙

#### Tailwind 브레이크포인트 사용
```typescript
// 모바일 기본, 데스크톱 md: 접두사
<div className="hidden md:block">데스크톱만</div>
<div className="block md:hidden">모바일만</div>
```

#### 컨테이너 제한
```typescript
// 데스크톱에서 콘텐츠 너비 제한
<div className="w-full md:max-w-md md:mx-auto">
  {/* 콘텐츠 */}
</div>
```

### 8.6 n8n 준비성 (Future Proofing)

#### URL 쿼리 파라미터 의존
- 전통적인 로그인/회원가입 없음
- 인증은 n8n에서 전송된 링크 자체
- 토큰 기반 인증 (향후 추가 가능)

#### 웹훅 준비
```typescript
// lib/api.ts (향후 구현)
export const sendToN8N = async (endpoint: string, data: any) => {
  // 현재는 주석 처리
  // const response = await fetch(`${process.env.NEXT_PUBLIC_N8N_WEBHOOK}/${endpoint}`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // return response.json();
  
  // 개발 중: 콘솔 로그
  console.log('N8N Webhook:', endpoint, data);
};
```

---

## 9. 배포 및 운영 전략

### 9.1 배포 환경

#### 개발 환경
- **로컬**: `npm run dev`
- **테스트**: Vercel Preview Deploy

#### 프로덕션 환경
- **플랫폼**: Vercel (권장) 또는 Netlify
- **도메인**: `ouscaravan.com` 또는 서브도메인
- **HTTPS**: 필수 (PWA 요구사항)

### 9.2 PWA 설정

#### Manifest 파일
```json
{
  "name": "OUSCARAVAN Concierge",
  "short_name": "OUS",
  "description": "Smart Concierge for OUSCARAVAN",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAFAFA",
  "theme_color": "#FF7E5F",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Service Worker
- 오프라인 지원 (선택사항)
- 캐싱 전략

### 9.3 성능 최적화

#### 이미지 최적화
- Next.js Image 컴포넌트 사용
- WebP 포맷 우선
- Lazy loading

#### 코드 스플리팅
- 탭별 코드 스플리팅
- 동적 import 사용

#### 번들 크기 최적화
- Tree shaking
- 불필요한 라이브러리 제거

### 9.4 분석 및 모니터링

#### 추적 지표
- 페이지뷰
- 체크인/체크아웃 완료율
- 주문 전환율
- 사용자 세션 시간

#### 도구 (향후)
- Google Analytics
- Vercel Analytics

### 9.5 업데이트 전략

#### 데이터 업데이트
- `constants.ts` 파일 수정으로 텍스트/메뉴 업데이트
- 재배포 없이 환경 변수로 일부 설정 변경 가능

#### 기능 업데이트
- Git 기반 버전 관리
- 단계적 배포 (Vercel Preview → Production)

---

## 10. 향후 확장 계획

### 10.1 Phase 2 기능

- **실시간 채팅**: 게스트-관리자 실시간 소통
- **리뷰 시스템**: 체크아웃 후 리뷰 작성
- **추천 시스템**: 날씨 기반 활동 추천
- **멀티 언어**: 영어 지원

### 10.2 Phase 3 기능

- **결제 통합**: 주문 시 결제 처리
- **로열티 프로그램**: 재방문 고객 혜택
- **AI 챗봇**: 자동 응답 시스템

---

## 11. 체크리스트

### 11.1 개발 전 체크리스트

- [ ] 프로젝트 초기화 (Next.js 14+)
- [ ] 의존성 설치 (Framer Motion, Vaul, Shadcn, Zustand 등)
- [ ] Tailwind CSS 설정
- [ ] 디자인 시스템 구축 (컬러, 타이포그래피)
- [ ] 기본 레이아웃 구성 (반응형 네비게이션)

### 11.2 기능 개발 체크리스트

#### HOME 탭
- [ ] URL 파라미터 파싱
- [ ] 환영 메시지 (Framer Motion)
- [ ] WiFi 카드 (복사, QR 코드)
- [ ] 시간 카드
- [ ] 일몰 위젯
- [ ] 체크인/체크아웃 기능

#### GUIDE 탭
- [ ] 검색 바
- [ ] 카테고리 필터
- [ ] 아코디언 가이드
- [ ] BBQ 캐러셀 모달

#### MARKET 탭
- [ ] 쿠폰 플립 카드
- [ ] 메뉴 캐러셀
- [ ] 카페 정보
- [ ] 주문 폼 (불멍/바베큐)

#### HELP 탭
- [ ] FAB (전화 버튼)
- [ ] 안전 정보
- [ ] FAQ

### 11.3 테스트 체크리스트

- [ ] 모바일 반응형 테스트
- [ ] 데스크톱 반응형 테스트
- [ ] 브라우저 호환성 (Chrome, Safari, Firefox)
- [ ] PWA 설치 테스트
- [ ] 오프라인 동작 테스트

### 11.4 배포 전 체크리스트

- [ ] 환경 변수 설정
- [ ] 도메인 연결
- [ ] HTTPS 설정
- [ ] PWA Manifest 검증
- [ ] 성능 최적화 확인
- [ ] SEO 메타 태그 설정

---

## 12. 참고 자료

### 12.1 디자인 참고

- **브랜드 컬러**: OUSCARAVAN 브랜드 가이드
- **이미지**: 일몰, 오션뷰, 시설 사진

### 12.2 기술 문서

- [Next.js Documentation](https://nextjs.org/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Zustand](https://github.com/pmndrs/zustand)

### 12.3 n8n 통합 가이드 (향후)

- n8n 워크플로우 설계 문서
- API 엔드포인트 명세
- 데이터 매핑 규칙

---

## 부록: 용어 정의

- **PWA**: Progressive Web App (프로그레시브 웹 앱)
- **n8n**: 워크플로우 자동화 플랫폼
- **FAB**: Floating Action Button (플로팅 액션 버튼)
- **CTA**: Call-to-Action (행동 유도 버튼)
- **SSR**: Server-Side Rendering (서버 사이드 렌더링)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15  
**작성자**: Development Team
