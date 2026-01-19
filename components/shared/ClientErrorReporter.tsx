'use client';

import { useEffect } from 'react';
import { getToken } from '@/lib/auth-client';

function isKakaoInAppBrowser() {
  if (typeof navigator === 'undefined') return false;
  return /KAKAOTALK/i.test(navigator.userAgent);
}

function buildBaseContext() {
  if (typeof window === 'undefined') return {};
  return {
    href: window.location.href,
    pathname: window.location.pathname,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    inApp: {
      kakao: isKakaoInAppBrowser(),
    },
    // 토큰은 보내지 않음(존재 여부만)
    hasToken: !!getToken(),
  };
}

async function sendClientLog(payload: Record<string, unknown>) {
  try {
    await fetch('/api/client-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // 페이지 종료 중에도 전송 시도
    });
  } catch {
    // ignore
  }
}

export function ClientErrorReporter() {
  useEffect(() => {
    const base = buildBaseContext();

    // 페이지 진입 로그(흰 화면이면 여기까지도 못 올 수 있으나, 오면 최소 추적 가능)
    sendClientLog({ type: 'page_view', ...base });

    const onError = (event: ErrorEvent) => {
      sendClientLog({
        type: 'window_error',
        ...base,
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        errorName: event.error?.name,
        errorMessage: event.error?.message,
        stack: event.error?.stack,
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as any;
      sendClientLog({
        type: 'unhandled_rejection',
        ...base,
        reasonType: typeof reason,
        reasonMessage: reason?.message ?? String(reason),
        stack: reason?.stack,
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}

