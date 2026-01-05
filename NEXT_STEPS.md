# 향후 작업 가이드

## 🎯 우선순위별 작업 계획

### 🔴 즉시 진행 (1주일 내)

#### 1. n8n 기본 설정
- [ ] n8n 설치 (Cloud 또는 Self-Hosted)
- [ ] 기본 워크플로우 생성
- [ ] 웹훅 URL 확인 및 환경 변수 설정

#### 2. API 엔드포인트 구현
- [ ] `app/api/n8n/checkin/route.ts` 생성
- [ ] `app/api/n8n/checkout/route.ts` 생성
- [ ] `app/api/n8n/order/route.ts` 생성
- [ ] `lib/api.ts` 업데이트 (API 엔드포인트 사용)

#### 3. 기본 테스트
- [ ] 로컬 환경에서 체크인 테스트
- [ ] 로컬 환경에서 체크아웃 테스트
- [ ] 로컬 환경에서 주문 테스트
- [ ] n8n 워크플로우 실행 확인

---

### 🟡 단기 작업 (2-4주)

#### 4. 데이터베이스 연동
- [ ] 데이터베이스 선택 (PostgreSQL 권장)
- [ ] 데이터베이스 서버 설정 (Supabase, Railway, 또는 자체 호스팅)
- [ ] 테이블 스키마 생성
  - [ ] `checkins` 테이블
  - [ ] `checkouts` 테이블
  - [ ] `orders` 테이블
  - [ ] `guests` 테이블 (선택사항)
- [ ] n8n 데이터베이스 노드 설정

**데이터베이스 스키마 예시:**

```sql
-- 체크인 테이블
CREATE TABLE checkins (
  id SERIAL PRIMARY KEY,
  guest VARCHAR(255) NOT NULL,
  room VARCHAR(100) NOT NULL,
  checkin_time TIMESTAMP NOT NULL,
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 체크아웃 테이블
CREATE TABLE checkouts (
  id SERIAL PRIMARY KEY,
  guest VARCHAR(255) NOT NULL,
  room VARCHAR(100) NOT NULL,
  checkout_time TIMESTAMP NOT NULL,
  gas_locked BOOLEAN DEFAULT false,
  trash_cleaned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 주문 테이블
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(255) UNIQUE NOT NULL,
  guest VARCHAR(255) NOT NULL,
  room VARCHAR(100) NOT NULL,
  order_type VARCHAR(50) NOT NULL,
  items JSONB NOT NULL,
  total_amount INTEGER NOT NULL,
  delivery_time TIME,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_checkins_guest ON checkins(guest);
CREATE INDEX idx_checkins_room ON checkins(room);
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_status ON orders(status);
```

#### 5. 카카오톡 메시지 발송
- [ ] 카카오톡 비즈니스 채널 등록
- [ ] 카카오톡 API 키 발급
- [ ] n8n 카카오톡 노드 설정
- [ ] 메시지 템플릿 작성
  - [ ] 체크인 완료 메시지
  - [ ] 체크아웃 완료 메시지
  - [ ] 주문 접수 메시지
  - [ ] 주문 준비 완료 메시지

**카카오톡 메시지 템플릿 예시:**

```
[체크인 완료]
{{guest}}님, 체크인이 완료되었습니다.
객실: {{room}}
체크인 시간: {{checkinTime}}
WiFi 정보는 앱에서 확인하실 수 있습니다.
```

#### 6. 주문 상태 업데이트 시스템
- [ ] 주문 상태 업데이트 API 엔드포인트
- [ ] 관리자용 주문 상태 변경 인터페이스 (간단한 웹 페이지)
- [ ] 웹 앱에서 주문 상태 실시간 업데이트
  - [ ] Polling 방식 (간단)
  - [ ] WebSocket 방식 (향후)

---

### 🟢 중기 작업 (1-2개월)

#### 7. 네이버 예약 연동
- [ ] 네이버 예약 API 문서 확인
- [ ] 네이버 예약 API 키 발급
- [ ] n8n 워크플로우 생성
  - [ ] 예약 데이터 수집
  - [ ] 게스트 정보 추출
  - [ ] 고유 링크 생성
  - [ ] 카카오톡 메시지 발송
- [ ] 테스트 및 검증

**고유 링크 생성 로직:**

```typescript
// n8n Function 노드에서 사용
const token = generateUniqueToken();
const link = `https://ouscaravan.com/home?guest=${guestName}&room=${room}&checkin=${checkinDate}&checkout=${checkoutDate}&token=${token}`;
```

#### 8. 재고 관리 시스템
- [ ] 재고 데이터베이스 설계
- [ ] 재고 관리 API
- [ ] 주문 시 재고 확인 로직
- [ ] 재고 부족 알림
- [ ] 자동 재고 차감

**재고 테이블 스키마:**

```sql
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  item_id VARCHAR(100) UNIQUE NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER DEFAULT 10,
  unit VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 재고 이력 테이블
CREATE TABLE inventory_history (
  id SERIAL PRIMARY KEY,
  item_id VARCHAR(100) NOT NULL,
  change_type VARCHAR(50) NOT NULL, -- 'order', 'restock', 'adjustment'
  quantity_change INTEGER NOT NULL,
  order_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 9. 관리자 대시보드
- [ ] 대시보드 페이지 생성
- [ ] 체크인/체크아웃 현황
- [ ] 주문 관리 인터페이스
- [ ] 재고 관리 인터페이스
- [ ] 통계 및 리포트

**기능 목록:**
- 실시간 체크인/체크아웃 현황
- 주문 목록 및 상태 변경
- 재고 현황 및 관리
- 일일/주간/월간 통계
- 게스트 정보 조회

---

### 🔵 장기 작업 (3-6개월)

#### 10. 고급 기능
- [ ] 실시간 채팅 (게스트-관리자)
- [ ] 리뷰 시스템
- [ ] 추천 시스템 (날씨 기반)
- [ ] 멀티 언어 지원
- [ ] 결제 통합
- [ ] 로열티 프로그램

#### 11. 분석 및 최적화
- [ ] 사용자 행동 분석
- [ ] 주문 패턴 분석
- [ ] A/B 테스트
- [ ] 성능 최적화
- [ ] SEO 최적화

---

## 📋 단계별 구현 가이드

### Phase 1: 기본 자동화 (1-2주)

**목표**: 체크인/체크아웃/주문 데이터가 n8n으로 전송되는 것 확인

**작업:**
1. n8n 설치 및 기본 설정
2. 워크플로우 3개 생성 (체크인, 체크아웃, 주문)
3. 환경 변수 설정
4. 기본 테스트

**완료 기준:**
- 웹 앱에서 체크인/체크아웃/주문 시 n8n 워크플로우가 실행됨
- n8n에서 데이터 수신 확인

### Phase 2: 데이터 저장 (2-3주)

**목표**: 모든 데이터를 데이터베이스에 저장

**작업:**
1. 데이터베이스 설정
2. 테이블 스키마 생성
3. n8n 데이터베이스 노드 설정
4. 데이터 저장 테스트

**완료 기준:**
- 체크인/체크아웃/주문 데이터가 데이터베이스에 저장됨
- 데이터 조회 가능

### Phase 3: 알림 시스템 (3-4주)

**목표**: 카카오톡 메시지 자동 발송

**작업:**
1. 카카오톡 비즈니스 채널 등록
2. 카카오톡 API 연동
3. 메시지 템플릿 작성
4. 알림 발송 테스트

**완료 기준:**
- 체크인/체크아웃/주문 시 카카오톡 메시지 발송
- 게스트 및 관리자 모두 알림 수신

### Phase 4: 네이버 예약 연동 (4-6주)

**목표**: 네이버 예약 자동 처리 및 고유 링크 발송

**작업:**
1. 네이버 예약 API 연동
2. 예약 데이터 자동 수집
3. 고유 링크 생성 및 발송
4. 전체 프로세스 테스트

**완료 기준:**
- 네이버 예약 시 자동으로 카카오톡 메시지 발송
- 게스트가 링크 클릭 시 웹 앱 접속 및 자동 로그인

### Phase 5: 고급 기능 (6주 이상)

**목표**: 재고 관리, 관리자 대시보드 등 고급 기능 구현

**작업:**
1. 재고 관리 시스템
2. 관리자 대시보드
3. 주문 상태 실시간 업데이트
4. 통계 및 리포트

**완료 기준:**
- 모든 기능이 정상 작동
- 관리자가 효율적으로 업무 처리 가능

---

## 🛠️ 필요한 도구 및 서비스

### 필수
- **n8n**: 워크플로우 자동화
- **데이터베이스**: PostgreSQL 또는 MySQL
- **호스팅**: Vercel (웹 앱), n8n Cloud 또는 자체 호스팅

### 선택사항
- **카카오톡 비즈니스**: 메시지 발송
- **Supabase/Railway**: 데이터베이스 호스팅
- **Sentry**: 에러 모니터링
- **Vercel Analytics**: 사용자 분석

---

## 📞 지원 및 리소스

### 문서
- [n8n 공식 문서](https://docs.n8n.io/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [카카오톡 비즈니스 API](https://developers.kakao.com/docs)

### 커뮤니티
- [n8n 커뮤니티 포럼](https://community.n8n.io/)
- [Next.js Discord](https://nextjs.org/discord)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
