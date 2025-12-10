/**
 * @file components/web-vitals.tsx
 * @description Web Vitals 측정 컴포넌트
 *
 * Next.js의 web-vitals 패키지를 사용하여 성능 지표를 측정합니다.
 * CLS, FID/INP, LCP, FCP, TTFB를 측정하고 로깅합니다.
 */

"use client";

import { useEffect } from "react";
import { onCLS, onFID, onINP, onLCP, onFCP, onTTFB } from "next/web-vitals";

export function WebVitals() {
  useEffect(() => {
    // CLS (Cumulative Layout Shift) 측정
    onCLS((metric) => {
      console.log("CLS:", metric);
      // 프로덕션에서는 분석 서비스로 전송
      if (process.env.NODE_ENV === "production") {
        // TODO: 분석 서비스로 전송 (예: Vercel Analytics, Google Analytics)
      }
    });

    // FID (First Input Delay) 측정
    onFID((metric) => {
      console.log("FID:", metric);
      if (process.env.NODE_ENV === "production") {
        // TODO: 분석 서비스로 전송
      }
    });

    // INP (Interaction to Next Paint) 측정
    onINP((metric) => {
      console.log("INP:", metric);
      if (process.env.NODE_ENV === "production") {
        // TODO: 분석 서비스로 전송
      }
    });

    // LCP (Largest Contentful Paint) 측정
    onLCP((metric) => {
      console.log("LCP:", metric);
      if (process.env.NODE_ENV === "production") {
        // TODO: 분석 서비스로 전송
      }
    });

    // FCP (First Contentful Paint) 측정
    onFCP((metric) => {
      console.log("FCP:", metric);
      if (process.env.NODE_ENV === "production") {
        // TODO: 분석 서비스로 전송
      }
    });

    // TTFB (Time to First Byte) 측정
    onTTFB((metric) => {
      console.log("TTFB:", metric);
      if (process.env.NODE_ENV === "production") {
        // TODO: 분석 서비스로 전송
      }
    });
  }, []);

  return null;
}

