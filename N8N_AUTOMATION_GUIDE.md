# n8n 자동화 설정 가이드

## 📋 목차

1. [개요](#1-개요)
2. [n8n 설치 및 설정](#2-n8n-설치-및-설정)
3. [워크플로우 설계](#3-워크플로우-설계)
4. [이메일 트래킹 → 카카오톡 발송](#4-이메일-트래킹--카카오톡-발송)
5. [Next.js API 엔드포인트 설정](#5-nextjs-api-엔드포인트-설정)
6. [환경 변수 설정](#6-환경-변수-설정)
7. [테스트 및 검증](#7-테스트-및-검증)
8. [향후 작업](#8-향후-작업)

---

## 1. 개요

### 1.1 자동화 시나리오

```
[게스트 예약]
  ↓
[네이버 예약 시스템]
  ↓
[n8n 워크플로우 트리거]
  ↓
[게스트 정보 추출 및 저장]
  ↓
[카카오톡 메시지 발송 (고유 링크 포함)]
  ↓
[게스트가 링크 클릭]
  ↓
[OUSCARAVAN 앱 접속 (자동 로그인)]
  ↓
[컨시어지 서비스 이용]
  ↓
[체크인/체크아웃 자동 처리]
  ↓
[주문 자동화]
```

### 1.2 주요 기능

- **자동 체크인/체크아웃**: 웹 앱에서 체크인/체크아웃 시 n8n으로 데이터 전송
- **주문 자동화**: 불멍/바베큐 주문 시 n8n으로 주문 정보 전송
- **알림 시스템**: 카카오톡 메시지 발송, 관리자 알림
- **데이터 관리**: 게스트 정보, 주문 내역, 체크인/체크아웃 기록 저장

---

## 2. n8n 설치 및 설정

### 2.1 n8n 설치 옵션

#### 옵션 1: n8n Cloud (권장 - 간편함)

1. [n8n Cloud](https://n8n.io/cloud) 접속
2. 계정 생성 및 로그인
3. 워크스페이스 생성

**장점**: 
- 빠른 설정
- 자동 업데이트
- 안정적인 호스팅

**단점**: 
- 유료 플랜 필요 (무료 플랜 제한적)

#### 옵션 2: Self-Hosted (자체 호스팅)

**Docker를 사용한 설치:**

```bash
# Docker Compose 파일 생성
cat > docker-compose.yml << EOF
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_secure_password
      - N8N_HOST=your-domain.com
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://your-domain.com/
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - n8n-network

volumes:
  n8n_data:

networks:
  n8n-network:
EOF

# 실행
docker-compose up -d
```

**환경 변수 설명:**
- `N8N_BASIC_AUTH_ACTIVE`: 기본 인증 활성화
- `N8N_BASIC_AUTH_USER`: 사용자 이름
- `N8N_BASIC_AUTH_PASSWORD`: 비밀번호
- `N8N_HOST`: 도메인 주소
- `N8N_PROTOCOL`: 프로토콜 (https)
- `WEBHOOK_URL`: 웹훅 URL

### 2.2 n8n 초기 설정

1. **접속**: `http://localhost:5678` 또는 n8n Cloud URL
2. **계정 생성**: 첫 접속 시 관리자 계정 생성
3. **워크스페이스 설정**: 워크스페이스 이름 및 설정

---

## 3. 워크플로우 설계

### 3.1 워크플로우 1: 체크인 처리

**목적**: 웹 앱에서 체크인 시 n8n으로 데이터 전송 및 처리

**노드 구성:**

```
[Webhook] → [Set] → [IF] → [카카오톡 메시지] → [데이터베이스 저장]
```

**상세 설정:**

#### 1. Webhook 노드
- **Method**: POST
- **Path**: `checkin`
- **Response Mode**: Respond to Webhook
- **Authentication**: None (또는 API Key)

#### 2. Set 노드 (데이터 정리)
```json
{
  "guest": "{{ $json.body.guest }}",
  "room": "{{ $json.body.room }}",
  "checkinTime": "{{ $json.body.checkinTime }}",
  "source": "{{ $json.body.source }}"
}
```

#### 3. IF 노드 (조건 확인)
- **Condition**: `checkinTime`이 오늘 날짜인지 확인

#### 4. 카카오톡 메시지 노드 (선택사항)
- **메시지 템플릿**: 
```
{{ $json.guest }}님, 체크인이 완료되었습니다.
객실: {{ $json.room }}
체크인 시간: {{ $json.checkinTime }}
```

#### 5. 데이터베이스 저장 노드
- **Database**: PostgreSQL, MySQL, 또는 Airtable
- **Operation**: Insert
- **Table**: `checkins`

**데이터베이스 스키마 예시:**
```sql
CREATE TABLE checkins (
  id SERIAL PRIMARY KEY,
  guest VARCHAR(255) NOT NULL,
  room VARCHAR(100) NOT NULL,
  checkin_time TIMESTAMP NOT NULL,
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 워크플로우 2: 체크아웃 처리

**노드 구성:**

```
[Webhook] → [Set] → [IF] → [카카오톡 메시지] → [데이터베이스 저장] → [관리자 알림]
```

**상세 설정:**

#### 1. Webhook 노드
- **Method**: POST
- **Path**: `checkout`
- **Response Mode**: Respond to Webhook

#### 2. Set 노드
```json
{
  "guest": "{{ $json.body.guest }}",
  "room": "{{ $json.body.room }}",
  "checkoutTime": "{{ $json.body.checkoutTime }}",
  "checklist": {
    "gasLocked": "{{ $json.body.checklist.gasLocked }}",
    "trashCleaned": "{{ $json.body.checklist.trashCleaned }}"
  }
}
```

#### 3. IF 노드
- **Condition**: 체크리스트가 모두 완료되었는지 확인

#### 4. 카카오톡 메시지 노드
```
{{ $json.guest }}님, 체크아웃이 완료되었습니다.
객실: {{ $json.room }}
체크아웃 시간: {{ $json.checkoutTime }}
감사합니다!
```

#### 5. 관리자 알림 노드
- **이메일** 또는 **카카오톡**으로 관리자에게 알림

### 3.3 워크플로우 3: 주문 처리

**노드 구성:**

```
[Webhook] → [Set] → [IF (재고 확인)] → [데이터베이스 저장] → [관리자 알림] → [게스트 확인 메시지]
```

**상세 설정:**

#### 1. Webhook 노드
- **Method**: POST
- **Path**: `order`
- **Response Mode**: Respond to Webhook

#### 2. Set 노드
```json
{
  "guest": "{{ $json.body.guest }}",
  "room": "{{ $json.body.room }}",
  "orderType": "{{ $json.body.orderType }}",
  "items": "{{ $json.body.items }}",
  "totalAmount": "{{ $json.body.totalAmount }}",
  "deliveryTime": "{{ $json.body.deliveryTime }}",
  "notes": "{{ $json.body.notes }}",
  "orderId": "{{ $json.body.orderId }}"
}
```

#### 3. IF 노드 (재고 확인)
- **Condition**: 재고가 충분한지 확인 (향후 구현)

#### 4. 데이터베이스 저장
```sql
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
```

#### 5. 관리자 알림
```
새로운 주문이 접수되었습니다!
주문 번호: {{ $json.orderId }}
게스트: {{ $json.guest }}
객실: {{ $json.room }}
주문 유형: {{ $json.orderType }}
총액: {{ $json.totalAmount }}원
배송 시간: {{ $json.deliveryTime }}
```

#### 6. 게스트 확인 메시지
```
주문이 접수되었습니다!
주문 번호: {{ $json.orderId }}
배송 시간: {{ $json.deliveryTime }}
곧 준비해드리겠습니다!
```

### 3.4 워크플로우 4: 네이버 예약 연동 (향후)

**노드 구성:**

```
[네이버 예약 API] → [데이터 변환] → [게스트 정보 저장] → [고유 링크 생성] → [카카오톡 메시지 발송]
```

**고유 링크 생성 예시:**
```
https://ouscaravan.com/home?guest={{ $json.guestName }}&room={{ $json.room }}&checkin={{ $json.checkinDate }}&checkout={{ $json.checkoutDate }}&token={{ $json.uniqueToken }}
```

---

## 4. 이메일 트래킹 → 카카오톡 발송

### 4.1 개요

네이버 예약 완료 시 발송되는 이메일을 자동으로 감지하고, 게스트에게 카카오톡 메시지로 고유 링크를 발송하는 워크플로우입니다.

**자세한 내용은 [EMAIL_TO_KAKAO_WORKFLOW.md](./EMAIL_TO_KAKAO_WORKFLOW.md) 문서를 참고하세요.**

### 4.2 워크플로우 구조

```
[이메일 트리거 (Gmail/Outlook/IMAP)]
  ↓
[이메일 파싱 (Code 노드)]
  ↓
[게스트 정보 추출]
  ↓
[고유 링크 생성]
  ↓
[카카오톡 메시지 발송 (HTTP Request)]
  ↓
[데이터베이스 저장]
```

### 4.3 주요 노드 설정

#### 이메일 트리거
- **Gmail Trigger**: Gmail API 사용 (권장)
- **Outlook Trigger**: Microsoft 계정 사용
- **IMAP Email Trigger**: 범용 이메일 서버

#### 카카오톡 발송
- **HTTP Request 노드** 사용 (기본 노드)
- 카카오톡 REST API 직접 호출
- 친구톡 또는 알림톡 사용 가능

**카카오톡 API 설정은 [KAKAO_API_SETUP.md](./KAKAO_API_SETUP.md) 문서를 참고하세요.**

---

## 5. Next.js API 엔드포인트 설정

### 4.1 API 엔드포인트 생성

현재 `lib/api.ts`에서 n8n 웹훅을 직접 호출하고 있지만, 서버 사이드 API 엔드포인트를 추가로 생성하여 보안을 강화할 수 있습니다.

#### 체크인 API 엔드포인트

**파일**: `app/api/n8n/checkin/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sendCheckInToN8N } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 데이터 검증
    if (!data.guest || !data.room || !data.checkinTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // n8n 웹훅으로 전송
    const success = await sendCheckInToN8N({
      guest: data.guest,
      room: data.room,
      checkinTime: data.checkinTime,
      source: data.source || 'web_app',
    });
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send to n8n' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Check-in API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 체크아웃 API 엔드포인트

**파일**: `app/api/n8n/checkout/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sendCheckOutToN8N } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 데이터 검증
    if (!data.guest || !data.room || !data.checkoutTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // n8n 웹훅으로 전송
    const success = await sendCheckOutToN8N({
      guest: data.guest,
      room: data.room,
      checkoutTime: data.checkoutTime,
      checklist: data.checklist || {
        gasLocked: false,
        trashCleaned: false,
      },
    });
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send to n8n' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Check-out API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 주문 API 엔드포인트

**파일**: `app/api/n8n/order/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderToN8N } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 데이터 검증
    if (!data.guest || !data.room || !data.orderType || !data.items || !data.totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // n8n 웹훅으로 전송
    const success = await sendOrderToN8N({
      guest: data.guest,
      room: data.room,
      orderType: data.orderType,
      items: data.items,
      totalAmount: data.totalAmount,
      deliveryTime: data.deliveryTime,
      notes: data.notes,
    });
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send to n8n' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, orderId: data.orderId });
  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 4.2 클라이언트 코드 업데이트

`lib/api.ts` 파일을 업데이트하여 API 엔드포인트를 사용하도록 수정:

```typescript
// lib/api.ts 업데이트 예시
const USE_API_ENDPOINTS = true; // API 엔드포인트 사용 여부

export async function sendCheckInToN8N(data: CheckInData): Promise<boolean> {
  if (USE_API_ENDPOINTS) {
    // Next.js API 엔드포인트 사용
    try {
      const response = await fetch('/api/n8n/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.ok;
    } catch (error) {
      console.error('[API] Failed to send check-in:', error);
      return false;
    }
  } else {
    // 직접 n8n 웹훅 호출 (기존 방식)
    // ... 기존 코드
  }
}
```

---

## 6. 환경 변수 설정

### 5.1 로컬 개발 환경

**파일**: `.env.local` (Git에 커밋하지 않음)

```env
# n8n 웹훅 URL
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook

# 또는 개별 엔드포인트
NEXT_PUBLIC_N8N_CHECKIN_WEBHOOK=https://your-n8n-instance.com/webhook/checkin
NEXT_PUBLIC_N8N_CHECKOUT_WEBHOOK=https://your-n8n-instance.com/webhook/checkout
NEXT_PUBLIC_N8N_ORDER_WEBHOOK=https://your-n8n-instance.com/webhook/order

# n8n API Key (선택사항 - 보안 강화)
N8N_API_KEY=your_api_key_here
```

### 5.2 Vercel 환경 변수 설정

1. **Vercel 대시보드** 접속
2. **프로젝트 선택** → **Settings** → **Environment Variables**
3. **다음 변수 추가:**

| 변수 이름 | 값 | 환경 |
|---------|-----|------|
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | `https://your-n8n-instance.com/webhook` | Production, Preview, Development |
| `N8N_API_KEY` | `your_api_key` | Production, Preview, Development |

### 5.3 n8n 웹훅 URL 확인 방법

1. **n8n 워크플로우 편집**
2. **Webhook 노드 클릭**
3. **"Test URL" 또는 "Production URL" 복사**
4. **환경 변수에 설정**

**예시 URL 형식:**
```
https://your-n8n-instance.com/webhook/checkin
https://your-n8n-instance.com/webhook/checkout
https://your-n8n-instance.com/webhook/order
```

---

## 7. 테스트 및 검증

### 6.1 로컬 테스트

#### 1. n8n 워크플로우 테스트

1. **n8n 워크플로우 활성화**
2. **Webhook 노드에서 "Test URL" 복사**
3. **Postman 또는 curl로 테스트:**

```bash
# 체크인 테스트
curl -X POST https://your-n8n-instance.com/webhook/checkin \
  -H "Content-Type: application/json" \
  -d '{
    "guest": "테스트 게스트",
    "room": "A1",
    "checkinTime": "2024-01-15T15:00:00Z",
    "source": "web_app"
  }'

# 체크아웃 테스트
curl -X POST https://your-n8n-instance.com/webhook/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "guest": "테스트 게스트",
    "room": "A1",
    "checkoutTime": "2024-01-17T11:00:00Z",
    "checklist": {
      "gasLocked": true,
      "trashCleaned": true
    }
  }'

# 주문 테스트
curl -X POST https://your-n8n-instance.com/webhook/order \
  -H "Content-Type: application/json" \
  -d '{
    "guest": "테스트 게스트",
    "room": "A1",
    "orderType": "bbq",
    "items": [
      {
        "id": "bbq-small",
        "name": "바베큐 세트 (소)",
        "quantity": 1,
        "price": 30000
      }
    ],
    "totalAmount": 30000,
    "deliveryTime": "18:00",
    "notes": "테스트 주문"
  }'
```

#### 2. 웹 앱 테스트

1. **로컬 개발 서버 실행**: `npm run dev`
2. **브라우저에서 테스트 URL 접속:**
   ```
   http://localhost:3000/home?guest=테스트&room=A1
   ```
3. **체크인 버튼 클릭**
4. **n8n 워크플로우 실행 확인**
5. **데이터베이스 또는 로그 확인**

### 6.2 프로덕션 테스트

1. **Vercel에 배포**
2. **환경 변수 확인**
3. **실제 게스트 정보로 테스트**
4. **n8n 워크플로우 실행 확인**
5. **알림 발송 확인**

---

## 8. 향후 작업

### 7.1 단기 작업 (1-2주)

#### 1. 데이터베이스 연동
- [ ] PostgreSQL 또는 MySQL 데이터베이스 설정
- [ ] 테이블 스키마 생성
- [ ] n8n 데이터베이스 노드 설정

#### 2. 카카오톡 메시지 발송
- [ ] 카카오톡 비즈니스 채널 등록
- [ ] 카카오톡 API 키 발급
- [ ] n8n 카카오톡 노드 설정
- [ ] 메시지 템플릿 작성

#### 3. 주문 상태 업데이트
- [ ] 관리자 대시보드 (주문 상태 변경)
- [ ] 웹 앱에서 주문 상태 실시간 업데이트
- [ ] WebSocket 또는 Polling 구현

### 7.2 중기 작업 (1-2개월)

#### 1. 네이버 예약 연동
- [ ] 네이버 예약 API 연동
- [ ] 예약 데이터 자동 수집
- [ ] 고유 링크 자동 생성
- [ ] 카카오톡 메시지 자동 발송

#### 2. 재고 관리 시스템
- [ ] 재고 데이터베이스 설계
- [ ] 재고 확인 로직 구현
- [ ] 재고 부족 알림
- [ ] 자동 재고 차감

#### 3. 관리자 대시보드
- [ ] 체크인/체크아웃 현황
- [ ] 주문 관리
- [ ] 재고 관리
- [ ] 통계 및 리포트

### 7.3 장기 작업 (3-6개월)

#### 1. 고급 기능
- [ ] 실시간 채팅 (게스트-관리자)
- [ ] 리뷰 시스템
- [ ] 추천 시스템 (날씨 기반)
- [ ] 멀티 언어 지원

#### 2. 분석 및 최적화
- [ ] 사용자 행동 분석
- [ ] 주문 패턴 분석
- [ ] A/B 테스트
- [ ] 성능 최적화

---

## 8. 문제 해결

### 8.1 일반적인 문제

#### 웹훅이 작동하지 않음
- **확인 사항:**
  - n8n 워크플로우가 활성화되어 있는지
  - 웹훅 URL이 정확한지
  - 환경 변수가 올바르게 설정되었는지
  - CORS 설정이 올바른지

#### 데이터가 전송되지 않음
- **확인 사항:**
  - 네트워크 연결 상태
  - n8n 워크플로우 실행 로그
  - 브라우저 콘솔 에러
  - Vercel 로그

#### 알림이 발송되지 않음
- **확인 사항:**
  - 카카오톡 API 키 유효성
  - 메시지 템플릿 형식
  - 수신자 정보 정확성

### 8.2 디버깅 팁

1. **n8n 실행 로그 확인**
2. **브라우저 개발자 도구 네트워크 탭 확인**
3. **Vercel 함수 로그 확인**
4. **데이터베이스 로그 확인**

---

## 9. 보안 고려사항

### 9.1 웹훅 보안

#### API Key 인증 추가

**n8n Webhook 노드 설정:**
- **Authentication**: Header Auth
- **Name**: `X-API-Key`
- **Value**: 환경 변수에서 가져오기

**Next.js API 엔드포인트에서 검증:**
```typescript
const apiKey = request.headers.get('X-API-Key');
if (apiKey !== process.env.N8N_API_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

#### HTTPS 사용
- 모든 웹훅 URL은 HTTPS를 사용해야 합니다
- 자체 호스팅 시 SSL 인증서 설정

### 9.2 데이터 보안

- **개인정보 암호화**: 게스트 정보 암호화 저장
- **토큰 기반 인증**: 고유 링크에 토큰 포함
- **데이터 보존 정책**: 오래된 데이터 자동 삭제

---

## 10. 체크리스트

### 설정 완료 체크리스트

- [ ] n8n 설치 및 설정 완료
- [ ] 워크플로우 생성 및 활성화
- [ ] 환경 변수 설정 (로컬 및 Vercel)
- [ ] API 엔드포인트 생성
- [ ] 데이터베이스 설정 (선택사항)
- [ ] 카카오톡 연동 (선택사항)
- [ ] 테스트 완료
- [ ] 프로덕션 배포

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
