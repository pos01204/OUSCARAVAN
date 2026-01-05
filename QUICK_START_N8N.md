# n8n 빠른 시작 가이드

## 🚀 5분 안에 시작하기

### 1단계: n8n 설정 (5분)

#### 옵션 A: n8n Cloud 사용 (가장 빠름)

1. [n8n Cloud](https://n8n.io/cloud) 접속
2. 무료 계정 생성
3. 워크스페이스 생성 완료

#### 옵션 B: 로컬 설치 (Docker)

```bash
# Docker Compose 파일 생성
cat > docker-compose.yml << EOF
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_password
    volumes:
      - n8n_data:/home/node/.n8n
volumes:
  n8n_data:
EOF

# 실행
docker-compose up -d
```

### 2단계: 첫 번째 워크플로우 생성 (10분)

#### 체크인 워크플로우

1. **n8n 대시보드** → **"Add workflow"** 클릭
2. **"Webhook"** 노드 추가
   - **Method**: POST
   - **Path**: `checkin`
   - **Response Mode**: "Respond to Webhook"
3. **"Set"** 노드 추가 (Webhook 다음)
   - 데이터 정리:
     ```
     guest: {{ $json.body.guest }}
     room: {{ $json.body.room }}
     checkinTime: {{ $json.body.checkinTime }}
     ```
4. **"Respond to Webhook"** 노드 추가
   - **Response Code**: 200
   - **Response Body**: `{ "success": true }`
5. **워크플로우 활성화** (우측 상단 토글)
6. **Webhook URL 복사** (Webhook 노드에서 "Test URL" 클릭)

### 3단계: 환경 변수 설정 (2분)

#### 로컬 개발

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
```

#### Vercel 배포

1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. 변수 추가:
   - **Name**: `NEXT_PUBLIC_N8N_WEBHOOK_URL`
   - **Value**: n8n Webhook URL
   - **Environment**: Production, Preview, Development

### 4단계: 테스트 (3분)

1. **로컬 서버 실행**: `npm run dev`
2. **브라우저에서 접속**: `http://localhost:3000/home?guest=테스트&room=A1`
3. **체크인 버튼 클릭**
4. **n8n 워크플로우 실행 확인**

## ✅ 완료!

이제 체크인 데이터가 n8n으로 전송됩니다!

## 다음 단계

1. **체크아웃 워크플로우** 생성 (동일한 방식)
2. **주문 워크플로우** 생성 (동일한 방식)
3. **데이터베이스 연동** (선택사항)
4. **카카오톡 메시지 발송** (선택사항)

자세한 내용은 `N8N_AUTOMATION_GUIDE.md`를 참고하세요.
