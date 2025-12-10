import type { MetadataRoute } from "next";

/**
 * @file app/manifest.ts
 * @description PWA Manifest 파일
 *
 * PWA 설치를 위한 메타데이터를 정의합니다.
 * 아이콘, 테마 색상, 디스플레이 모드 등을 설정합니다.
 */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My Trip - 한국 관광지 정보 서비스",
    short_name: "My Trip",
    description:
      "전국 관광지 정보를 한 곳에서 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}

