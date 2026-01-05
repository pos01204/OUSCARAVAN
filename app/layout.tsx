import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/shared/BottomNav";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OUSCARAVAN - 스마트 컨시어지",
  description:
    "OUSCARAVAN을 위한 프리미엄 컨시어지 서비스. WiFi, 가이드, 카페 쿠폰을 한 번에!",
  keywords: ["글램핑", "캠핑", "컨시어지", "OUSCARAVAN", "속초"],
  authors: [{ name: "OUSCARAVAN" }],
  openGraph: {
    title: "OUSCARAVAN - 스마트 컨시어지",
    description: "OUSCARAVAN을 위한 프리미엄 컨시어지 서비스",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "OUSCARAVAN - 스마트 컨시어지",
    description: "OUSCARAVAN을 위한 프리미엄 컨시어지 서비스",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: "#FF7E5F",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen pb-16 pt-16 md:pb-0 md:pt-0">
          <div className="container mx-auto max-w-md px-4 py-6 md:max-w-2xl">
            {children}
          </div>
        </main>
        <Footer />
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
