import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootLayoutWrapper } from "@/components/shared/RootLayoutWrapper";
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
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FF7E5F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <RootLayoutWrapper>
          {children}
        </RootLayoutWrapper>
        <Toaster />
      </body>
    </html>
  );
}
