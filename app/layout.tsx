import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/shared/BottomNav";
import { Header } from "@/components/shared/Header";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OUSCARAVAN Concierge",
  description: "Smart Concierge for OUSCARAVAN",
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
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
