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

export interface FloorPlanConfig {
  viewBox: string;         // SVG viewBox (예: "0 0 800 600")
  spaces: FloorPlanSpace[]; // 공간 목록
  grid?: {
    columns: number;       // 그리드 열 수
    rows: number;         // 그리드 행 수
    gap: number;          // 공간 간 간격
  };
}

/**
 * 약도 설정
 * 실제 약도 구조에 맞춰 좌표 조정 완료
 * 레이아웃: 4열 2행 (1-4호, 5-8호) + 2개 (9-10호)
 */
export const FLOOR_PLAN_CONFIG: FloorPlanConfig = {
  viewBox: "0 0 800 500",  // SVG 뷰포트 크기 (실제 약도에 맞게 조정)
  grid: {
    columns: 4,            // 4열 그리드
    rows: 3,               // 3행 그리드 (2행 + 1행)
    gap: 15,               // 공간 간 간격 (픽셀)
  },
  spaces: [
    // 첫 번째 행: 1-4호 (4인실)
    {
      id: '1',
      name: '1호',
      displayName: '1호',
      coordinates: { x: 20, y: 20, width: 180, height: 140 },
      capacity: 4,
    },
    {
      id: '2',
      name: '2호',
      displayName: '2호',
      coordinates: { x: 220, y: 20, width: 180, height: 140 },
      capacity: 4,
    },
    {
      id: '3',
      name: '3호',
      displayName: '3호',
      coordinates: { x: 420, y: 20, width: 180, height: 140 },
      capacity: 4,
    },
    {
      id: '4',
      name: '4호',
      displayName: '4호',
      coordinates: { x: 620, y: 20, width: 180, height: 140 },
      capacity: 4,
    },
    // 두 번째 행: 5-8호 (5,7,8호는 4인실, 6호는 2인실)
    {
      id: '5',
      name: '5호',
      displayName: '5호',
      coordinates: { x: 20, y: 180, width: 180, height: 140 },
      capacity: 4,
    },
    {
      id: '6',
      name: '6호',
      displayName: '6호',
      coordinates: { x: 220, y: 180, width: 180, height: 140 },
      capacity: 2,
    },
    {
      id: '7',
      name: '7호',
      displayName: '7호',
      coordinates: { x: 420, y: 180, width: 180, height: 140 },
      capacity: 4,
    },
    {
      id: '8',
      name: '8호',
      displayName: '8호',
      coordinates: { x: 620, y: 180, width: 180, height: 140 },
      capacity: 4,
    },
    // 세 번째 행: 9-10호 (9호는 4인실, 10호는 2인실)
    {
      id: '9',
      name: '9호',
      displayName: '9호',
      coordinates: { x: 20, y: 340, width: 180, height: 140 },
      capacity: 4,
    },
    {
      id: '10',
      name: '10호',
      displayName: '10호',
      coordinates: { x: 220, y: 340, width: 180, height: 140 },
      capacity: 2,
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
