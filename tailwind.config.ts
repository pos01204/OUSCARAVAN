import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // ═══════════════════════════════════════════════════
        // 브랜드 색상 시스템 — 라이트 테마
        // ═══════════════════════════════════════════════════
        
        // 배경 (라이트) — 무채색 회색 계열
        background: "#F7F7F7",           // 깔끔한 연한 회색
        "background-elevated": "#FFFFFF", // 카드 배경 (순백)
        "background-muted": "#F0F0F0",    // 보조 배경 (약간 진한 회색)
        "background-accent": "#E8E8E8",   // 강조 배경 (중간 회색)
        
        // 브랜드 다크 (텍스트용)
        "brand-dark": "#1A1714",          // 주요 텍스트 (따뜻한 검정)
        "brand-dark-soft": "#3D3730",     // 보조 텍스트
        "brand-dark-muted": "#6B6358",    // 힌트/캡션
        "brand-dark-faint": "#9C9488",    // 비활성
        
        // 브랜드 크림/베이지 (악센트용)
        "brand-cream": "#E8DCC8",         // 브랜드 시그니처 색상
        "brand-cream-dark": "#C4B896",    // 테두리/구분선
        "brand-cream-deep": "#A89F8A",    // 진한 포인트
        
        // 텍스트
        foreground: "#1A1714",            // 주요 텍스트
        "muted-foreground": "#6B6358",    // 보조 텍스트
        
        // Primary (다크 버튼)
        primary: {
          DEFAULT: "#1A1714",
          foreground: "#FAF8F5",
        },
        
        // Secondary (크림 버튼)
        secondary: {
          DEFAULT: "#E8DCC8",
          foreground: "#1A1714",
        },
        
        // Accent
        accent: {
          DEFAULT: "#EDE8DF",
          foreground: "#1A1714",
        },
        
        // 테두리
        border: "rgba(196, 184, 150, 0.3)",
        "border-emphasis": "rgba(196, 184, 150, 0.5)",
        "border-strong": "#C4B896",
        
        // 카드
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1714",
        },
        
        // Muted
        muted: {
          DEFAULT: "#F5F2ED",
          foreground: "#6B6358",
        },
        
        // 상태 색상 (라이트 테마용)
        "status-success": "#16A34A",
        "status-warning": "#CA8A04",
        "status-error": "#DC2626",
        "status-info": "#2563EB",
        
        // Destructive
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        
        // Ring (포커스)
        ring: "#C4B896",
        
        // 고양이 가이드 전용 색상
        cat: {
          pink: "#FFE4E6",      // rose-100 (연분홍)
          peach: "#FFEDD5",     // orange-100 (연주황)
          cream: "#FEF3C7",     // amber-100 (크림)
          lavender: "#EDE9FE",  // violet-100 (연보라)
          mint: "#D1FAE5",      // emerald-100 (민트)
          brown: "#B45309",     // amber-700 (발자국)
          orange: "#FB923C",    // orange-400 (강조)
        },
      },
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        heading: ["Paperlogy", "Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        body: ["Onglip Dahyun", "Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        cat: ["Paperlogy", "Onglip Dahyun", "Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // 라이트 테마용 부드러운 그림자
        "soft-sm": "0 1px 2px rgba(26, 23, 20, 0.04), 0 1px 3px rgba(26, 23, 20, 0.06)",
        "soft-md": "0 4px 8px rgba(26, 23, 20, 0.06), 0 2px 4px rgba(26, 23, 20, 0.04)",
        "soft-lg": "0 12px 24px rgba(26, 23, 20, 0.08), 0 4px 8px rgba(26, 23, 20, 0.04)",
        "hover": "0 8px 20px rgba(26, 23, 20, 0.1)",
        "card": "0 1px 3px rgba(26, 23, 20, 0.05), 0 1px 2px rgba(26, 23, 20, 0.03)",
        "card-hover": "0 8px 16px rgba(26, 23, 20, 0.08), 0 2px 4px rgba(26, 23, 20, 0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
        "lift": "lift 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        lift: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-4px)" },
        },
      },
      perspective: {
        "1000": "1000px",
      },
      borderRadius: {
        "xl": "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};

export default config;
