import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Base URL 설정 (환경변수 또는 자동 감지)
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  // 프로덕션 환경에서는 https, 개발 환경에서는 http
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  // 기본값 (실제로는 런타임에 headers에서 가져와야 하지만, metadata는 빌드 타임에 평가됨)
  return `${protocol}://localhost:3000`;
}

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "My Trip - 한국 관광지 정보 서비스",
  description:
    "전국 관광지 정보를 한 곳에서 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스",
  keywords: [
    "관광지",
    "여행",
    "한국",
    "관광정보",
    "여행코스",
    "문화시설",
    "축제",
  ],
  openGraph: {
    title: "My Trip - 한국 관광지 정보 서비스",
    description:
      "전국 관광지 정보를 한 곳에서 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스",
    url: baseUrl,
    siteName: "My Trip",
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "My Trip - 한국 관광지 정보 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Trip - 한국 관광지 정보 서비스",
    description:
      "전국 관광지 정보를 한 곳에서 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SyncUserProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Toaster />
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
