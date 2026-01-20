'use client';

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/30 py-2.5 mb-14 md:mb-0 md:border-t-0 md:py-3">
      <div className="container mx-auto max-w-md px-4 md:max-w-2xl">
        <div className="space-y-0.5 text-center text-xs text-muted-foreground">
          <p className="font-medium text-foreground text-sm">오우스카라반</p>
          <p>사업자 등록번호: 887-08-01964</p>
          <p className="text-[10px]">
            © {new Date().getFullYear()} OUSCARAVAN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
