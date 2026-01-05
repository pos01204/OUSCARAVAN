'use client';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-6 pb-20 md:border-t-0 md:pb-6">
      <div className="container mx-auto max-w-md px-4 md:max-w-2xl">
        <div className="space-y-2 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground">오우스카라반</p>
          <p>사업자 등록번호: 887-08-01964</p>
          <p className="text-xs">
            © {new Date().getFullYear()} OUSCARAVAN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
