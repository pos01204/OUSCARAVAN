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
 * CSV 그리드 형식에 맞춰 정확한 좌표 조정 완료
 * 
 * CSV 그리드 구조 (8열 5행):
 * 행 1: 주차공간1(열1-2), 주차공간2(열4-8)
 * 행 2: 관리동(열1-2), 카페(열4-8)
 * 행 3: 2호(열1), 1호(열2)
 * 행 4: 4호(열1), 3호(열2), 건물/창고(열4-5), 7호(열6), 8호(열7), 9호(열8)
 * 행 5: 6호(열1), 5호(열2), 주차공간3(열4-5), 10호(열7)
 * 
 * 레이아웃 구조:
 * - 왼쪽 섹션 (열 1-2): 주차공간 1, 관리동, 1-6호 (2열 3행)
 * - 중앙: 도로 (열 3)
 * - 오른쪽 섹션 (열 4-8): 주차공간 2, 카페, 건물/창고(열4-5), 주차공간 3(열4-5), 7-10호
 * 
 * 방 배치:
 * - 왼쪽 열 (위→아래): 2호, 4호, 6호
 * - 왼쪽 오른쪽 열 (위→아래): 1호, 3호, 5호
 * - 오른쪽 행 4 (왼→오): 7호(열6), 8호(열7), 9호(열8)
 * - 오른쪽 행 5 열 7: 10호
 * 
 * 좌표 계산:
 * - viewBox: "0 0 800 280"
 * - 각 열 너비: (800 - 7*4 간격) / 8 = 96.5 → 96
 * - 열 위치: 열1=10, 열2=110, 열3=210(도로), 열4=218, 열5=318, 열6=418, 열7=518, 열8=618
 * - 행 위치: 행1=10, 행2=64, 행3=120, 행4=174, 행5=228
 */
export const FLOOR_PLAN_CONFIG: FloorPlanConfig = {
  viewBox: "0 0 750 280",  // SVG 뷰포트 크기 (도로 너비 확대로 조정)
  grid: {
    columns: 8,            // CSV 그리드 8열
    rows: 5,               // CSV 그리드 5행
    gap: 4,                // 공간 간 간격 (픽셀)
  },
  spaces: [
    // CSV 그리드 구조에 맞춰 배치 (8열 구조)
    // 도로 너비 확대: 기존 218 → 240 (22px 증가)
    // 열 위치: 열1=10, 열2=110, 도로=206~234, 열4=240, 열5=340, 열6=440, 열7=540, 열8=640

    // 행 3: 2호(열1), 1호(열2)
    {
      id: '2',
      name: '2호',
      displayName: '카라반 2',
      coordinates: { x: 10, y: 120, width: 96, height: 50 },
      capacity: 4,
    },
    {
      id: '1',
      name: '1호',
      displayName: '카라반 1',
      coordinates: { x: 110, y: 120, width: 96, height: 50 },
      capacity: 4,
    },
    // 행 4: 4호(열1), 3호(열2), 건물/창고(열4), 7호(열6), 8호(열7), 9호(열8)
    {
      id: '4',
      name: '4호',
      displayName: '카라반 4',
      coordinates: { x: 10, y: 174, width: 96, height: 50 },
      capacity: 4,
    },
    {
      id: '3',
      name: '3호',
      displayName: '카라반 3',
      coordinates: { x: 110, y: 174, width: 96, height: 50 },
      capacity: 4,
    },
    {
      id: '7',
      name: '7호',
      displayName: '카라반 7',
      coordinates: { x: 440, y: 174, width: 96, height: 50 }, // 열6 (도로 확대로 +22)
      capacity: 4,
    },
    {
      id: '8',
      name: '8호',
      displayName: '카라반 8',
      coordinates: { x: 540, y: 174, width: 96, height: 50 }, // 열7 (도로 확대로 +22)
      capacity: 4,
    },
    {
      id: '9',
      name: '9호',
      displayName: '카라반 9',
      coordinates: { x: 640, y: 174, width: 96, height: 50 }, // 열8 (도로 확대로 +22)
      capacity: 4,
    },
    // 행 5: 6호(열1), 5호(열2), 주차공간3(열4), 10호(열7)
    {
      id: '6',
      name: '6호',
      displayName: '카라반 6',
      coordinates: { x: 10, y: 228, width: 96, height: 50 },
      capacity: 2,
    },
    {
      id: '5',
      name: '5호',
      displayName: '카라반 5',
      coordinates: { x: 110, y: 228, width: 96, height: 50 },
      capacity: 4,
    },
    {
      id: '10',
      name: '10호',
      displayName: '카라반 10',
      coordinates: { x: 540, y: 228, width: 96, height: 50 }, // 열7 (도로 확대로 +22)
      capacity: 2,
    },
  ],
  facilities: [
    // CSV 그리드 구조에 맞춰 배치 (8열 구조)
    // 도로 너비 확대: 기존 218 → 240 (22px 증가)
    // 열 위치: 열1=10, 열2=110, 도로=206~234, 열4=240

    // 행 1: 주차공간1(열1-2), 주차공간2(열4-8)
    {
      id: 'parking-1',
      name: '주차공간 1',
      coordinates: { x: 10, y: 10, width: 196, height: 50 }, // 열1-2 (96*2 + 4 간격)
      type: 'parking',
    },
    {
      id: 'parking-2',
      name: '주차공간 2',
      coordinates: { x: 240, y: 10, width: 492, height: 50 }, // 열4-8 (도로 확대로 +22)
      type: 'parking',
    },
    // 행 2: 관리동(열1-2), 카페(열4-8)
    {
      id: 'management',
      name: '관리동',
      coordinates: { x: 10, y: 64, width: 196, height: 50 }, // 열1-2
      type: 'building',
    },
    {
      id: 'cafe',
      name: '카페(오우스마켓)',
      coordinates: { x: 240, y: 64, width: 492, height: 50 }, // 열4-8 (도로 확대로 +22)
      type: 'cafe',
    },
    // 행 4: 건물/창고(열4-5) - CSV에서 2개 열 차지
    {
      id: 'warehouse',
      name: '', // 텍스트 노출하지 않음
      coordinates: { x: 240, y: 174, width: 196, height: 50 }, // 열4-5 (도로 확대로 +22)
      type: 'warehouse',
    },
    // 행 5: 주차공간3(열4-5) - CSV에서 2개 열 차지
    {
      id: 'parking-3',
      name: '주차공간 3',
      coordinates: { x: 240, y: 228, width: 196, height: 50 }, // 열4-5 (도로 확대로 +22)
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
