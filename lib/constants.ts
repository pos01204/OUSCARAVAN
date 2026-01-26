/**
 * API 설정
 */
export const API_CONFIG = {
  // Railway 백엔드 API URL
  // 기본값은 실제 Railway URL로 설정 (환경 변수가 없을 경우)
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://ouscaravan-production.up.railway.app',
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
  // 비밀번호 없음 - 카라반 내에서 자동 연결
  password: '',
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
import type { GuideItem } from '@/types';

export const GUIDE_DATA: { categories: string[]; items: GuideItem[] } = {
  categories: ['전체', '실내', '요리', '편의시설', '규칙'],
  items: [
    {
      id: 'heating',
      category: '실내',
      title: '난방/에어컨 사용법',
      overview: '벽면 컨트롤러로 온도를 조절할 수 있습니다.',
      content: '객실 벽면에 설치된 컨트롤러를 사용하여 난방과 냉방을 조절할 수 있습니다.',
      images: [],
      warning: false,
      troubleshooting: [
        {
          id: 'trouble-1',
          problem: '전원이 켜지지 않음',
          solution: '화면이 아예 켜지지 않으면 배터리 문제일 수 있습니다. 배터리가 잘 장착되어 있는지 확인해주세요. 여전히 작동하지 않으면 관리자에게 연락해주세요.',
          requiresContact: true,
          contactMethod: 'phone',
        },
      ],
      tags: ['난방', '에어컨', '온도', '컨트롤러', '실내'],
      priority: 5,
    },
    {
      id: 'hot-water',
      category: '편의시설',
      title: '온수 사용 안내',
      overview: '각 카라반당 온수는 100L 용량입니다. (대형카라반 기준 60L)',
      content: '각 카라반당 온수는 100L 용량입니다. (대형카라반 기준 60L) 계속해서 차가운 물이 나온다면 온수 용량을 모두 사용한 것으로, 온수가 데워지는 시간이 필요합니다.',
      images: [],
      warning: true,
      warningText: '계속 차가운 물이 나온다면 온수 용량을 모두 사용한 것으로, 데우는 시간이 필요합니다.',
      faq: [
        {
          id: 'faq-1',
          question: '온수가 계속 차가워요.',
          answer: '온수 용량(100L)을 모두 사용하셨을 수 있습니다. 약 20-30분 정도 기다리시면 온수가 다시 데워집니다.',
        },
      ],
      tags: ['온수', '샤워', '편의시설', '용량'],
      priority: 4,
    },
    {
      id: 'wifi',
      category: '편의시설',
      title: 'WiFi 연결',
      overview: '비밀번호 없이 사용 가능합니다. 가장 강하게 잡히는 WiFi에 연결해주세요.',
      content: '각 객실마다 WiFi 이름이 다릅니다. 비밀번호 없이 사용 가능하니, 카라반 내에서 가장 강하게 잡히는 WiFi에 연결해주세요.',
      images: [],
      warning: false,
      // steps 제거 - 목업 컴포넌트로 대체하여 UX 단순화
      troubleshooting: [
        {
          id: 'ts-wifi-1',
          problem: 'WiFi가 연결이 안 돼요',
          solution: 'WiFi 설정을 새로고침하거나, 기기를 재시작해보세요. 여전히 안 되면 관리자에게 연락해주세요.',
          requiresContact: true,
          contactMethod: 'phone',
        },
      ],
      tags: ['WiFi', '인터넷', '편의시설', '연결'],
      priority: 5,
    },
    {
      id: 'parking',
      category: '규칙',
      title: '주차 안내',
      overview: '객실 내 가까운 주차 공간에 주차해주세요.',
      content: '객실 내 가까운 주차 공간에 주차해주세요.',
      images: [],
      warning: false,
      tags: ['주차', '규칙', '차량'],
      priority: 2,
    },
    {
      id: 'trash',
      category: '규칙',
      title: '쓰레기 분리수거',
      overview: '분리수거만 카페 1층 자판기 뒤에 배출해주세요. 일반/음식물은 객실에 두셔도 됩니다.',
      content: '일반쓰레기와 음식물쓰레기는 객실에 두셔도 됩니다. 분리수거만 카페 1층 자판기 뒤에 배출해주세요.',
      images: [],
      warning: false,
      tags: ['쓰레기', '분리수거', '규칙', '환경'],
      priority: 2,
      trashCategories: [
        {
          id: 'general',
          name: '일반쓰레기',
          description: '객실에 두셔도 됩니다',
          examples: [
            '음식물이 묻은 포장지',
            '일회용 수저, 포크, 나이프',
            '일회용 컵 (플라스틱 코팅된 종이컵)',
            '더러운 비닐',
            '스티로폼 용기 (음식물이 묻은 경우)',
            '일회용 그릇',
          ],
        },
        {
          id: 'food-waste',
          name: '음식물',
          description: '객실에 두셔도 됩니다',
          examples: [
            '음식 찌꺼기',
            '과일 껍질',
            '채소 찌꺼기',
            '계란 껍질 (음식물 가능)',
            '커피 찌꺼기',
          ],
        },
        {
          id: 'recycling',
          name: '분리수거',
          description: '카페 1층 자판기 뒤에 배출해주세요',
          examples: [
            '비닐 (봉지류, 포장지, 쇼핑백)',
            '플라스틱 (페트병, 플라스틱 용기)',
            '종이/박스 (택배 박스, 신문지)',
            '병 (맥주병, 소주병, 유리병)',
            '캔 (음료수 캔, 맥주 캔)',
          ],
        },
      ],
    },
    {
      id: 'bbq',
      category: '요리',
      title: 'BBQ & 불멍 가이드',
      overview: '단계별 가이드를 확인하여 안전하게 사용하세요.',
      content: 'BBQ와 불멍 시설을 안전하게 사용하기 위한 단계별 가이드입니다. 각 단계를 순서대로 따라하시면 안전하게 이용하실 수 있습니다.',
      images: [],
      warning: false,
      hasCarousel: true,
      faq: [
        {
          id: 'faq-1',
          question: '가스가 떨어졌어요.',
          answer: '관리자에게 연락하여 가스 탱크 교체를 요청해주세요.',
        },
        {
          id: 'faq-2',
          question: '불이 잘 안 붙어요.',
          answer: '점화 버튼을 누른 후 천천히 90도 회전해주세요. 급격한 회전은 금지됩니다.',
        },
        {
          id: 'faq-3',
          question: '사용 후 어떻게 정리하나요?',
          answer: '가스 레버를 반드시 잠그고, 사용한 그릴은 식힌 후 정리해주세요.',
        },
      ],
      troubleshooting: [
        {
          id: 'trouble-1',
          problem: '가스가 나오지 않음',
          solution: '가스 레버 확인 → 가스 탱크 확인 → 관리자 연락',
          steps: ['가스 레버가 열려있는지 확인', '가스 탱크 확인', '여전히 나오지 않으면 관리자 연락'],
          requiresContact: true,
          contactMethod: 'phone',
        },
        {
          id: 'trouble-2',
          problem: '불이 잘 안 붙음',
          solution: '점화 버튼을 누른 후 천천히 90도 회전',
          requiresContact: false,
        },
      ],
      tips: [
        '사용 후에는 반드시 가스 레버를 잠가주세요.',
        '불 주변에 가연성 물질을 두지 마세요.',
        '사용 중에는 절대 불을 방치하지 마세요.',
      ],
      tags: ['BBQ', '불멍', '요리', '가스', '안전'],
      priority: 5,
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

// 메뉴 아이템 (카테고리별)
export const MENU_CATEGORIES = {
  signature: {
    id: 'signature',
    name: 'Signature & Local',
    koreanName: '시그니처 및 지역 특화',
    description: '',
    items: [
      {
        id: 'ous-latte',
        name: '오우스 라떼',
        description: '섞지 않고 마실 때 첫 맛은 고소하고 끝 맛은 곡물의 단맛이 느껴지는 시그니처 라떼',
        price: 7000,
        image: '/images/menu/ous-latte.jpg',
      },
      {
        id: 'ginseng-blended',
        name: '강화 인삼 블렌디드',
        description: '강화도 특산물인 인삼을 활용하여 건강하고 쌉싸름한 풍미를 살린 아이스 블렌디드 음료',
        price: 7800,
        image: '/images/menu/ginseng-blended.jpg',
      },
      {
        id: 'choco-matcha',
        name: '초코나무숲',
        description: '진한 말차와 초코가 어우러져 달콤 쌉싸름한 맛의 조화를 이룬 라떼',
        price: 7500,
        image: '/images/menu/choco-matcha.jpg',
      },
    ],
  },
  coffee: {
    id: 'coffee',
    name: 'Coffee',
    koreanName: '커피',
    description: '',
    items: [
      {
        id: 'americano',
        name: '아메리카노',
        description: '깔끔하고 밸런스 좋은 원두를 사용한 기본 커피',
        price: 5900,
        image: '/images/menu/americano.jpg',
      },
      {
        id: 'cafe-latte',
        name: '카페 라떼',
        description: '고소한 우유와 에스프레소가 조화를 이루는 부드러운 라떼',
        price: 6200,
        image: '/images/menu/cafe-latte.jpg',
      },
      {
        id: 'vanilla-bean-latte',
        name: '바닐라 빈 라떼',
        description: '천연 바닐라 빈의 향긋함이 느껴지는 달콤한 라떼',
        price: 6800,
        image: '/images/menu/vanilla-bean-latte.jpg',
      },
    ],
  },
  nonCoffee: {
    id: 'non-coffee',
    name: 'Non-Coffee & Ade',
    koreanName: '논커피 및 에이드',
    description: '',
    items: [
      {
        id: 'strawberry-latte',
        name: '리얼 딸기 라떼',
        description: '신선한 딸기 과육이 씹히는 달콤한 시즌 음료 (Only Ice)',
        price: 7600,
        image: '/images/menu/strawberry-latte.jpg',
      },
      {
        id: 'mango-juice',
        name: '100% 꾸덕 망고주스',
        description: '물을 섞지 않은 듯 진하고 걸쭉한 망고 본연의 맛',
        price: 7500,
        image: '/images/menu/mango-juice.jpg',
      },
      {
        id: 'yuzu-ade',
        name: '청귤 에이드',
        description: '상큼한 청귤 청과 탄산수가 만나 청량감을 주는 음료',
        price: 6900,
        image: '/images/menu/yuzu-ade.jpg',
      },
      {
        id: 'peach-oolong',
        name: '피치 우롱 티',
        description: '복숭아의 달콤한 향과 우롱차의 깔끔함이 어우러진 차',
        price: 6500,
        image: '/images/menu/peach-oolong.jpg',
      },
    ],
  },
  bakery: {
    id: 'bakery',
    name: 'Bakery & Dessert',
    koreanName: '베이커리 및 디저트',
    description: '',
    items: [
      {
        id: 'salt-bread',
        name: '소금빵',
        description: '고소한 버터 풍미와 소금의 짭조름함이 특징인 오우스 대표 빵',
        price: 3800,
        image: '/images/menu/salt-bread.jpg',
      },
      {
        id: 'cookie',
        name: '수제 쿠키',
        description: '초코칩, 견과류 등이 듬뿍 들어간 묵직한 스타일의 쿠키',
        price: 4000,
        image: '/images/menu/cookie.jpg',
      },
      {
        id: 'financier',
        name: '휘낭시에',
        description: '겉은 쫀득하고 속은 촉촉하게 구워낸 프랑스식 구움과자',
        price: 3200,
        image: '/images/menu/financier.jpg',
      },
    ],
  },
};

// 레거시 호환성을 위한 단일 배열 (deprecated)
export const MENU_ITEMS = Object.values(MENU_CATEGORIES).flatMap(category => category.items);

// 카페 정보
export const CAFE_INFO = {
  name: '오우스마켓 (OWS MARKET)',
  business: {
    businessName: '오우스마켓 (OWS MARKET)',
    representative: '강유진',
    businessNumber: '810-31-01206',
    businessType: '개인사업자 (일반과세자)',
    storeAddress: '인천광역시 강화군 삼산면 삼산북로 149',
    registeredAddress: '인천광역시 강화군 삼산면 삼산남로 903',
    phone: '0507-1335-5154',
    phoneType: '네이버 스마트콜/비즈니스 번호',
    businessCategory: '서비스, 소매 / 커피점, 기타 식품 소매업',
  },
  hours: {
    weekday: '09:00 - 18:00',
    weekend: '09:00 - 19:00',
    closed: '수요일 휴무',
  },
  phone: '0507-1335-5154',
  address: '인천광역시 강화군 삼산면 삼산북로 149',
};

// 키오스크 판매 물품
export const KIOSK_ITEMS = {
  beverages: {
    id: 'beverages',
    name: '음료/간식',
    items: [
      {
        id: 'water-500ml',
        name: '생수 500ml',
        price: 2000,
        image: '/images/kiosk/water-500ml.jpg',
      },
      {
        id: 'water-1.5l',
        name: '생수 1.5L',
        price: 3000,
        image: '/images/kiosk/water-1.5l.jpg',
      },
      {
        id: 'cola',
        name: '콜라',
        price: 3000,
        image: '/images/kiosk/cola.jpg',
      },
      {
        id: 'sprite',
        name: '사이다',
        price: 3000,
        image: '/images/kiosk/sprite.jpg',
      },
      {
        id: 'chips',
        name: '과자',
        price: 2500,
        image: '/images/kiosk/chips.jpg',
      },
      {
        id: 'chocolate',
        name: '초콜릿',
        price: 3000,
        image: '/images/kiosk/chocolate.jpg',
      },
    ],
  },
  dailyNecessities: {
    id: 'daily-necessities',
    name: '생필품',
    items: [
      {
        id: 'toothbrush',
        name: '칫솔',
        price: 3000,
        image: '/images/kiosk/toothbrush.jpg',
      },
      {
        id: 'toothpaste',
        name: '치약',
        price: 4000,
        image: '/images/kiosk/toothpaste.jpg',
      },
      {
        id: 'shampoo',
        name: '샴푸',
        price: 5000,
        image: '/images/kiosk/shampoo.jpg',
      },
      {
        id: 'body-wash',
        name: '바디워시',
        price: 5000,
        image: '/images/kiosk/body-wash.jpg',
      },
      {
        id: 'towel',
        name: '수건',
        price: 8000,
        image: '/images/kiosk/towel.jpg',
      },
      {
        id: 'tissue',
        name: '휴지',
        price: 2000,
        image: '/images/kiosk/tissue.jpg',
      },
    ],
  },
  others: {
    id: 'others',
    name: '기타 용품',
    items: [
      {
        id: 'ice',
        name: '얼음',
        price: 3000,
        image: '/images/kiosk/ice.jpg',
      },
      {
        id: 'charcoal',
        name: '숯 (추가)',
        price: 5000,
        image: '/images/kiosk/charcoal.jpg',
      },
      {
        id: 'lighter',
        name: '라이터',
        price: 2000,
        image: '/images/kiosk/lighter.jpg',
      },
      {
        id: 'trash-bag',
        name: '쓰레기봉투',
        price: 2000,
        image: '/images/kiosk/trash-bag.jpg',
      },
    ],
  },
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

// FAQ 데이터 (중요도 순으로 정렬)
export const FAQ_DATA = [
  // 우선순위 1 (최우선)
  {
    id: 'checkin',
    category: '체크인/체크아웃',
    question: '체크인 시간은 언제인가요?',
    answer: '체크인 시간은 오후 3시(15:00)입니다. 체크아웃은 오전 11시(11:00)입니다. 조기 체크인은 불가능하며, 체크인 시간 이후에만 입실 가능합니다.',
    priority: 5,
  },
  {
    id: 'early-checkin',
    category: '체크인/체크아웃',
    question: '조기 체크인 가능한가요?',
    answer: '조기 체크인은 불가능합니다. 체크인 시간(오후 3시) 이후에만 입실 가능합니다. 체크인 시간 전 도착 시 관리자에게 연락해주세요.',
    priority: 4,
  },
  // 우선순위 2 (높음)
  {
    id: 'wifi',
    category: '시설 이용',
    question: 'WiFi 비밀번호를 잊어버렸어요.',
    answer: '홈 화면의 WiFi 카드에서 비밀번호를 확인하거나 QR 코드를 스캔하세요. 안내 페이지에서도 WiFi 연결 방법을 확인할 수 있습니다.',
    priority: 3,
  },
  {
    id: 'bbq-order',
    category: '주문 및 결제',
    question: '바베큐 세트는 어떻게 주문하나요?',
    answer: '주문/카페 이용 탭에서 원하는 세트를 선택하고 주문하세요. 배송 시간을 지정할 수 있습니다.',
    priority: 3,
  },
  // 우선순위 3 (중간)
  {
    id: 'parking',
    category: '기타',
    question: '주차는 어디에 하나요?',
    answer: '지정된 주차장에 주차해주세요. 주차 안내는 안내 페이지에서 확인하실 수 있습니다.',
    priority: 2,
  },
];

// 응급 연락처
export const EMERGENCY_CONTACTS = {
  fire: {
    name: '소방서',
    number: '119',
    mapLink: 'https://map.naver.com/v5/search/강화군+소방서',
    priority: 1,
  },
  police: {
    name: '경찰서',
    number: '112',
    mapLink: 'https://map.naver.com/v5/search/강화군+경찰서',
    priority: 1,
  },
  hospital: {
    name: '응급실',
    number: '119', // 실제 병원 번호로 변경 필요
    description: '가장 가까운 병원',
    mapLink: 'https://map.naver.com/v5/search/강화군+응급실',
    priority: 1,
  },
  convenienceStore: {
    name: '편의점',
    description: '가장 가까운 편의점',
    mapLink: 'https://map.naver.com/v5/search/강화군+화도면+편의점',
    priority: 2,
  },
  manager: {
    name: '관리자',
    number: '0507-1335-5154',
    priority: 2,
  },
};
