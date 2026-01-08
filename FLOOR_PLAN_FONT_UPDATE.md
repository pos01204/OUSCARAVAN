# 약도 폰트 통일 및 두께 조정 완료

## ✅ 완료된 작업

### Pretendard 폰트 적용

**파일**: `components/features/FloorPlanSVG.tsx`

**변경 사항**:
모든 텍스트 요소의 `fontFamily`를 Pretendard로 통일하고, 적절한 `fontWeight`를 설정했습니다.

### 텍스트 요소별 폰트 설정

1. **도로 텍스트**:
   - 폰트: `'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`
   - 두께: `400` (Regular)
   - 크기: `7px`
   - 색상: `#6b7280`
   - **이유**: 작은 텍스트이므로 얇은 두께로 가독성 유지

2. **시설명 텍스트** (주차공간, 관리동, 카페):
   - 폰트: `'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`
   - 두께: `500` (Medium)
   - 크기: `12px`
   - 색상: `#374151`
   - **이유**: 가독성을 위해 중간 두께로 설정 (기존 600에서 500으로 조정)

3. **"당신의 공간" 레이블**:
   - 폰트: `'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`
   - 두께: `600` (SemiBold)
   - 크기: `14px`
   - 색상: `#ef4444`
   - **이유**: 강조를 위해 조금 더 굵은 두께로 설정 (기존 'bold'에서 600으로 변경)

---

## 🎨 개선 사항

### 일관된 타이포그래피
- 모든 텍스트가 Pretendard 폰트로 통일됨
- 프로젝트 전체 디자인 시스템과 일관성 유지
- 한글 텍스트에 최적화된 폰트 사용

### 적절한 두께 조절
- 텍스트 크기와 용도에 맞는 `fontWeight` 설정
- 가독성과 시각적 계층 구조 개선
- 과도하게 굵지 않은 자연스러운 두께

### 폴백 폰트 설정
- Pretendard 로드 실패 시 시스템 폰트로 자동 전환
- `-apple-system, BlinkMacSystemFont, system-ui, sans-serif` 폴백 체인

---

## 📁 수정된 파일

1. **`components/features/FloorPlanSVG.tsx`**
   - 도로 텍스트: Pretendard 적용, fontWeight 400
   - 시설명 텍스트: Pretendard 적용, fontWeight 500
   - "당신의 공간" 레이블: Pretendard 적용, fontWeight 600

---

## 📊 폰트 두께 비교

| 텍스트 요소 | 이전 | 이후 | 변경 이유 |
|------------|------|------|----------|
| 도로 | system-ui, 400 | Pretendard, 400 | 폰트 통일 |
| 시설명 | system-ui, 600 | Pretendard, 500 | 가독성 개선 |
| "당신의 공간" | system-ui, bold | Pretendard, 600 | 폰트 통일 및 일관성 |

---

**완료 일시**: 2026-01-XX  
**작성자**: AI Assistant  
**버전**: 13.0  
**상태**: Pretendard 폰트 통일 및 두께 조정 완료
