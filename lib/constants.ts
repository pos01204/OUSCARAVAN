/**
 * API 설정
 */
export const API_CONFIG = {
  // Railway 백엔드 API URL
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://ouscaravan-api.railway.app',
  // 타임아웃 설정 (기본 10초)
  timeout: 10000,
  // 재시도 설정
  retry: {
    maxAttempts: 3, // 최대 재시도 횟수
    initialDelay: 1000, // 초기 지연 시간 (ms)
    maxDelay: 5000, // 최대 지연 시간 (ms)
    backoffMultiplier: 2, // 지수 백오프 배수
  },
} as const;

/**
 * n8n Webhook 설정
 */
export const N8N_CONFIG = {
  // n8n Webhook URL (예약 배정 알림톡 발송용)
  webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '',
} as const;

/**
 * 관리자 인증 설정 (임시)
 * TODO: Railway 백엔드 API 연동 후 제거
 */
export const ADMIN_CREDENTIALS = {
  id: 'ouscaravan',
  password: '123456789a',
} as const;

/**
 * WiFi 정보
 */
export const WIFI_INFO = {
  ssid: 'OUS_Guest',
  password: 'OUS2024Guest!',
};

// 체크인/체크아웃 시간
export const CHECK_IN_OUT = {
  checkIn: '15:00',
  checkOut: '11:00',
};

// 일몰 시간 (실제로는 API 또는 계산 로직으로 업데이트)
export const SUNSET_TIME = {
  today: '19:24',
};

// 환영 메시지
export const WELCOME_MESSAGE = {
  default: 'Welcome, {name}.',
  korean: '{name}님, 환영합니다.',
};

// 가이드 데이터
export const GUIDE_DATA = {
  categories: ['전체', '실내', '요리', '편의시설', '규칙'],
  items: [
    {
      id: 'heating',
      category: '실내',
      title: '난방/에어컨 사용법',
      content: '컨트롤러를 사용하여 원하는 온도를 설정하세요. 권장 온도는 20-22도입니다.',
      images: [],
      warning: false,
    },
    {
      id: 'hot-water',
      category: '편의시설',
      title: '온수 사용 안내',
      content: '온수는 50L 용량으로 제한되어 있습니다. 샤워 간격은 최소 15분을 대기해주세요.',
      images: [],
      warning: true,
      warningText: '50L 용량 제한. 샤워 간격 15분 대기 필수',
    },
    {
      id: 'projector',
      category: '실내',
      title: '빔 프로젝터 연결 방법',
      content: 'HDMI 케이블을 연결하거나 스마트폰 미러링 기능을 사용하세요. iOS는 AirPlay, Android는 Miracast를 지원합니다.',
      images: [],
      warning: false,
    },
    {
      id: 'wifi',
      category: '편의시설',
      title: 'WiFi 연결',
      content: 'SSID: OUS_Guest, 비밀번호는 홈 화면에서 확인하세요.',
      images: [],
      warning: false,
    },
    {
      id: 'parking',
      category: '규칙',
      title: '주차 안내',
      content: '지정된 주차장에 주차해주세요. 차량 1대당 1대만 주차 가능합니다.',
      images: [],
      warning: false,
    },
    {
      id: 'trash',
      category: '규칙',
      title: '쓰레기 분리수거',
      content: '일반쓰레기, 재활용품, 음식물쓰레기를 분리하여 배출해주세요.',
      images: [],
      warning: false,
    },
    {
      id: 'bbq',
      category: '요리',
      title: 'BBQ & 불멍 가이드',
      content: '단계별 가이드를 확인하여 안전하게 사용하세요.',
      images: [],
      warning: false,
      hasCarousel: true,
    },
  ],
};

// BBQ 가이드 슬라이드
export const BBQ_GUIDE_SLIDES = [
  {
    id: 1,
    title: '전원 스트립 켜기',
    description: '전원 스트립의 스위치를 ON으로 설정하세요.',
    image: '/images/bbq/power-strip.jpg',
  },
  {
    id: 2,
    title: '가스 레버 확인',
    description: '가스 탱크의 레버가 열려있는지 확인하세요.',
    image: '/images/bbq/gas-lever.jpg',
  },
  {
    id: 3,
    title: '점화',
    description: '점화 버튼을 누르고 90도 회전하세요. (주의: 급격한 회전 금지)',
    image: '/images/bbq/ignition.jpg',
  },
  {
    id: 4,
    title: '불꽃 조절',
    description: '원하는 불꽃 세기로 조절하세요.',
    image: '/images/bbq/flame-control.jpg',
  },
  {
    id: 5,
    title: '즐기기',
    description: '안전하게 즐기세요!',
    image: '/images/bbq/enjoy.jpg',
  },
  {
    id: 6,
    title: '끄기',
    description: '사용 후 반드시 가스 레버를 잠그세요.',
    image: '/images/bbq/turn-off.jpg',
  },
];

// 메뉴 아이템
export const MENU_ITEMS = [
  {
    id: 'ous-latte',
    name: 'OUS Latte',
    description: '부드러운 라떼',
    price: 5000,
    image: '/images/menu/ous-latte.jpg',
  },
  {
    id: 'salt-bread',
    name: 'Salt Bread',
    description: '바삭한 소금빵',
    price: 4000,
    image: '/images/menu/salt-bread.jpg',
  },
  {
    id: 'ginseng-blended',
    name: 'Ginseng Blended',
    description: '건강한 인삼 블렌드',
    price: 6000,
    image: '/images/menu/ginseng-blended.jpg',
  },
];

// 카페 정보
export const CAFE_INFO = {
  name: 'OUSMARKET',
  hours: {
    weekday: '09:00 - 18:00',
    weekend: '09:00 - 19:00',
    closed: '수요일 휴무',
  },
  phone: '010-1234-5678',
  address: '강원도 속초시 OUSCARAVAN 내',
};

// 불멍/바베큐 세트
export const BBQ_SETS = [
  {
    id: 'bbq-small',
    name: '바베큐 세트 (소)',
    price: 30000,
    items: ['숯 1kg', '그릴', '고기 500g'],
    image: '/images/sets/bbq-small.jpg',
  },
  {
    id: 'bbq-medium',
    name: '바베큐 세트 (중)',
    price: 50000,
    items: ['숯 2kg', '그릴', '고기 1kg', '야채 세트'],
    image: '/images/sets/bbq-medium.jpg',
  },
  {
    id: 'bbq-large',
    name: '바베큐 세트 (대)',
    price: 70000,
    items: ['숯 3kg', '그릴', '고기 1.5kg', '야채 세트', '소스 세트'],
    image: '/images/sets/bbq-large.jpg',
  },
  {
    id: 'fire-small',
    name: '불멍 세트 (소)',
    price: 20000,
    items: ['장작 5kg', '불쏘시개'],
    image: '/images/sets/fire-small.jpg',
  },
  {
    id: 'fire-medium',
    name: '불멍 세트 (중)',
    price: 35000,
    items: ['장작 10kg', '불쏘시개', '마시멜로우'],
    image: '/images/sets/fire-medium.jpg',
  },
];

// FAQ 데이터
export const FAQ_DATA = [
  {
    id: 'checkin',
    category: '체크인/체크아웃',
    question: '체크인 시간은 언제인가요?',
    answer: '체크인 시간은 오후 3시입니다. 체크아웃은 오전 11시입니다.',
  },
  {
    id: 'wifi',
    category: '시설 이용',
    question: 'WiFi 비밀번호를 잊어버렸어요.',
    answer: '홈 화면에서 WiFi 카드를 클릭하여 비밀번호를 확인하거나 QR 코드를 스캔하세요.',
  },
  {
    id: 'bbq-order',
    category: '주문 및 결제',
    question: '바베큐 세트는 어떻게 주문하나요?',
    answer: '마켓 탭에서 원하는 세트를 선택하고 주문하세요. 배송 시간을 지정할 수 있습니다.',
  },
  {
    id: 'parking',
    category: '기타',
    question: '주차는 어디에 하나요?',
    answer: '지정된 주차장에 주차해주세요. 가이드 탭에서 주차 안내를 확인하실 수 있습니다.',
  },
];

// 응급 연락처
export const EMERGENCY_CONTACTS = {
  fire: { name: '소방서', number: '119' },
  police: { name: '경찰서', number: '112' },
  hospital: { name: '응급실', number: '010-9999-8888', description: '가장 가까운 병원' },
  pharmacy: { name: '24시간 약국', number: '010-8888-7777', description: '인근 약국' },
  manager: { name: '관리자', number: '010-1234-5678' },
};
