import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // 한국관광공사 이미지 도메인
      { hostname: "tong.visitkorea.or.kr" },
      { hostname: "www.visitkorea.or.kr" },
      // 기본 이미지 placeholder 서비스
      { hostname: "via.placeholder.com" },
      { hostname: "images.unsplash.com" },
    ],
  },
  // 패키지 최적화 설정
  experimental: {
    // 아이콘 라이브러리 최적화 (lucide-react는 이미 트리 쉐이킹 지원)
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

// 번들 분석기 설정 (ANALYZE=true일 때만 활성화)
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
