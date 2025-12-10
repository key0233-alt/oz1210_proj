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
};

export default nextConfig;
