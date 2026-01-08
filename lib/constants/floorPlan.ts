/**
 * 약도 설정 파일
 * 1호~10호 공간 정의 및 매핑
 */

export interface FloorPlanSpace {
  id: string;              // 공간 식별자 (예: "1", "2", ..., "10")
  name: string;            // 공간 이름 (표시용, 예: "1호", "2호")
  displayName: string;     // 표시 이름 (예: "1호")
  coordinates: {
    x: number;             // SVG 좌표 (viewBox 기준)
    y: number;             // SVG 좌표 (viewBox 기준)
    width: number;         // 너비
    height: number;        // 높이
  };
  capacity: number;        // 수용 인원 (4인실 또는 2인실)
}

export interface FloorPlanFacility {
  id: string;              // 시설 식별자
  name: string;            // 시설 이름 (예: "주차공간 1", "관리동")
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: 'parking' | 'building' | 'cafe' | 'warehouse'; // 시설 타입
}

export interface FloorPlanConfig {
  viewBox: string;         // SVG viewBox (예: "0 0 800 600")
  spaces: FloorPlanSpace[]; // 공간 목록
  facilities: FloorPlanFacility[]; // 시설 목록
  grid?: {
    columns: number;       // 그리드 열 수
    rows: number;         // 그리드 행 수
    gap: number;          // 공간 간 간격
  };
}

/**
 * 약도 설정
 * 실제 약도 구조에 맞춰 정확한 좌표 조정 완료
 * 
 * 레이아웃 구조:
 * - 왼쪽 섹션 (도로 서쪽): 주차공간 1, 관리동, 1-6호 (2열 3행)
 * - 중앙: 도로
 * - 오른쪽 섹션 (도로 동쪽): 주차공간 2, 카페, 건물/창고, 주차공간 3, 7-10호
 * 
 * 방 배치:
 * - 왼쪽 열 (위→아래): 2호, 4호, 6호
 * - 왼쪽 오른쪽 열 (위→아래): 1호, 3호, 5호
 * - 오른쪽 상단 행 (왼→오): 7호, 8호, 9호
 * - 오른쪽 하단: 10호
 */
export const FLOOR_PLAN_CONFIG: FloorPlanConfig = {
  viewBox: "0 0 600 310",  // SVG 뷰포트 크기 (하단 5~6호가 잘리지 않도록 높이 증가)
  grid: {
    columns: 2,            // 좌우 2개 섹션
    rows: 4,               // 행 수
    gap: 6,                // 공간 간 간격 (픽셀) - 추가 축소
  },
  spaces: [
    // 왼쪽 섹션 - 오른쪽 열 (1호, 3호, 5호)
    // 관리동 및 주차공간 1의 너비(280)에 맞춰 2개 방이 나란히 배치
    // 각 방 너비: (280 - 6 간격) / 2 = 137
    {
      id: '1',
      name: '1호',
      displayName: '1호',
      coordinates: { x: 153, y: 110, width: 137, height: 55 },
      capacity: 4,
    },
    {
      id: '3',
      name: '3호',
      displayName: '3호',
      coordinates: { x: 153, y: 175, width: 137, height: 55 },
      capacity: 4,
    },
    {
      id: '5',
      name: '5호',
      displayName: '5호',
      coordinates: { x: 153, y: 240, width: 137, height: 55 },
      capacity: 4,
    },
    // 왼쪽 섹션 - 왼쪽 열 (2호, 4호, 6호)
    {
      id: '2',
      name: '2호',
      displayName: '2호',
      coordinates: { x: 10, y: 110, width: 137, height: 55 },
      capacity: 4,
    },
    {
      id: '4',
      name: '4호',
      displayName: '4호',
      coordinates: { x: 10, y: 175, width: 137, height: 55 },
      capacity: 4,
    },
    {
      id: '6',
      name: '6호',
      displayName: '6호',
      coordinates: { x: 10, y: 240, width: 137, height: 55 },
      capacity: 2,
    },
    // 오른쪽 섹션 - ㅜ 형태 배치 (7-10호)
    // 주차공간 2 및 카페의 너비(286)에 맞춰 배치
    // 주차공간 3도 286 너비로 변경됨
    // 7-10호는 주차공간 3과 같은 너비 영역(286) 내에 배치
    // 상단 행: 7호, 8호, 9호 (3개 가로 배치)
    // 각 방 너비: (286 - 6*2 간격) / 3 = 약 91.33 → 91로 설정
    {
      id: '7',
      name: '7호',
      displayName: '7호',
      coordinates: { x: 304, y: 130, width: 91, height: 55 },
      capacity: 4,
    },
    {
      id: '8',
      name: '8호',
      displayName: '8호',
      coordinates: { x: 401, y: 130, width: 91, height: 55 },
      capacity: 4,
    },
    {
      id: '9',
      name: '9호',
      displayName: '9호',
      coordinates: { x: 498, y: 130, width: 91, height: 55 },
      capacity: 4,
    },
    // 하단 행: 10호 (1개만, 중앙 정렬)
    {
      id: '10',
      name: '10호',
      displayName: '10호',
      coordinates: { x: 401, y: 195, width: 91, height: 55 },
      capacity: 2,
    },
  ],
  facilities: [
    // 왼쪽 섹션 - 상단
    // 도로를 중앙(300)에 배치하기 위해 왼쪽 섹션 너비 조정
    // 도로 중앙: x: 296 (300 - 4, 도로 너비 8의 중앙)
    // 왼쪽 섹션 끝: x: 290 (도로 시작 전)
    {
      id: 'parking-1',
      name: '주차공간 1',
      coordinates: { x: 10, y: 10, width: 280, height: 45 },
      type: 'parking',
    },
    {
      id: 'management',
      name: '관리동',
      coordinates: { x: 10, y: 65, width: 280, height: 35 },
      type: 'building',
    },
    // 오른쪽 섹션 - 상단
    // 도로 중앙: x: 296, 도로 너비: 8
    // 오른쪽 섹션 시작: x: 304 (296 + 8)
    {
      id: 'parking-2',
      name: '주차공간 2',
      coordinates: { x: 304, y: 10, width: 286, height: 45 },
      type: 'parking',
    },
    {
      id: 'cafe',
      name: '카페(오우스마켓)',
      coordinates: { x: 304, y: 65, width: 286, height: 55 },
      type: 'cafe',
    },
    {
      id: 'warehouse',
      name: '', // 텍스트 노출하지 않음
      coordinates: { x: 304, y: 130, width: 286, height: 45 },
      type: 'warehouse',
    },
    {
      id: 'parking-3',
      name: '주차공간 3',
      coordinates: { x: 304, y: 185, width: 286, height: 35 },
      type: 'parking',
    },
  ],
};

/**
 * assignedRoom → spaceId 매핑
 * 예: "1호" → "1", "10호" → "10"
 */
export const ROOM_TO_SPACE_MAP: Record<string, string> = {
  '1호': '1',
  '2호': '2',
  '3호': '3',
  '4호': '4',
  '5호': '5',
  '6호': '6',
  '7호': '7',
  '8호': '8',
  '9호': '9',
  '10호': '10',
};

/**
 * spaceId → assignedRoom 역매핑
 * 예: "1" → "1호", "10" → "10호"
 */
export const SPACE_TO_ROOM_MAP: Record<string, string> = {
  '1': '1호',
  '2': '2호',
  '3': '3호',
  '4': '4호',
  '5': '5호',
  '6': '6호',
  '7': '7호',
  '8': '8호',
  '9': '9호',
  '10': '10호',
};

/**
 * 공간 ID로 공간 정보 조회
 */
export function getSpaceById(spaceId: string): FloorPlanSpace | undefined {
  return FLOOR_PLAN_CONFIG.spaces.find(space => space.id === spaceId);
}

/**
 * assignedRoom으로 공간 정보 조회
 */
export function getSpaceByRoom(assignedRoom: string): FloorPlanSpace | undefined {
  const spaceId = ROOM_TO_SPACE_MAP[assignedRoom];
  if (!spaceId) {
    return undefined;
  }
  return getSpaceById(spaceId);
}
