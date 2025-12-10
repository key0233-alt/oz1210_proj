/**
 * @file components/tour-detail/detail-map.tsx
 * @description 관광지 상세페이지 지도 컴포넌트
 *
 * 관광지의 위치를 네이버 지도에 표시하는 컴포넌트입니다.
 * 단일 관광지의 위치를 마커로 표시하고, 길찾기 기능을 제공합니다.
 *
 * @dependencies
 * - naver.maps: 네이버 지도 API (동적 로드)
 * - lib/utils/naver-maps: 네이버 지도 API 스크립트 로드
 * - lib/utils/coordinates: 좌표 변환 유틸리티
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { katecToWgs84 } from "@/lib/utils/coordinates";
import { loadNaverMapsScript } from "@/lib/utils/naver-maps";
import { cn } from "@/lib/utils";
import { Loader2, MapPin, Navigation, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { TourDetail } from "@/lib/types/tour";

interface DetailMapProps {
  /** 관광지 상세 정보 */
  detail: TourDetail;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 상세페이지 지도 컴포넌트
 */
export function DetailMap({ detail, className }: DetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markerRef = useRef<naver.maps.Marker | null>(null);
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCoordinates, setShowCoordinates] = useState(false);

  // 좌표 변환
  const coordinates = (() => {
    try {
      return katecToWgs84(detail.mapx, detail.mapy);
    } catch {
      return null;
    }
  })();

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || !coordinates) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 네이버 지도 API 스크립트 로드
        await loadNaverMapsScript();

        if (!isMounted || !mapRef.current) return;

        // 네이버 지도 API 확인
        if (!window.naver?.maps) {
          throw new Error("네이버 지도 API를 사용할 수 없습니다.");
        }

        // 지도 생성
        const map = new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(coordinates.lat, coordinates.lng),
          zoom: 15, // 상세 위치 표시에 적합한 줌 레벨
          mapTypeControl: false,
        });

        mapInstanceRef.current = map;
        setIsLoading(false);

        // 마커 생성
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(coordinates.lat, coordinates.lng),
          map,
          title: detail.title,
          icon: {
            content: `
              <div style="
                width: 40px;
                height: 40px;
                background-color: #3b82f6;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 8px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
              ">
                <div style="
                  width: 15px;
                  height: 15px;
                  background-color: white;
                  border-radius: 50%;
                "></div>
              </div>
            `,
            anchor: new window.naver.maps.Point(20, 20),
          },
        });

        markerRef.current = marker;

        // 마커 클릭 시 인포윈도우 표시
        window.naver.maps.Event.addListener(marker, "click", () => {
          const infoContent = `
            <div style="
              padding: 12px;
              min-width: 200px;
              max-width: 300px;
            ">
              <h3 style="
                margin: 0 0 8px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
              ">${detail.title}</h3>
              <p style="
                margin: 0;
                font-size: 14px;
                color: #6b7280;
              ">${detail.addr1}${detail.addr2 ? ` ${detail.addr2}` : ""}</p>
            </div>
          `;

          // 기존 인포윈도우 닫기
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }

          // 새 인포윈도우 생성
          const infoWindow = new window.naver.maps.InfoWindow({
            content: infoContent,
            maxWidth: 300,
            backgroundColor: "white",
            borderColor: "#e5e7eb",
            borderWidth: 1,
            anchorSize: { width: 10, height: 10 },
            pixelOffset: { width: 0, height: -10 },
          });

          infoWindow.open(map, marker);
          infoWindowRef.current = infoWindow;
        });
      } catch (err) {
        if (!isMounted) return;
        const errorMessage =
          err instanceof Error
            ? err.message
            : "지도를 초기화하는 중 오류가 발생했습니다.";
        setError(errorMessage);
        setIsLoading(false);
        console.error("지도 초기화 오류:", err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [coordinates, detail]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 마커 제거
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }

      // 인포윈도우 닫기
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }

      // 지도 인스턴스 정리
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 길찾기 버튼 핸들러
  const handleDirections = useCallback(() => {
    if (!coordinates) return;

    const { lat, lng } = coordinates;
    const title = encodeURIComponent(detail.title);
    const address = encodeURIComponent(detail.addr1);

    // 모바일 감지
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // 네이버 지도 앱 열기
      const appUrl = `nmap://route/car?dlat=${lat}&dlng=${lng}&dname=${title}`;
      window.location.href = appUrl;

      // 앱이 설치되지 않은 경우 웹으로 fallback
      setTimeout(() => {
        const webUrl = `https://map.naver.com/v5/directions/${lng},${lat}`;
        window.open(webUrl, "_blank");
      }, 500);
    } else {
      // 데스크톱: 네이버 지도 웹 열기
      const webUrl = `https://map.naver.com/v5/directions/${lng},${lat}`;
      window.open(webUrl, "_blank");
    }
  }, [coordinates, detail]);

  // 좌표 복사 핸들러
  const handleCopyCoordinates = useCallback(async () => {
    if (!coordinates) return;

    const coordText = `위도: ${coordinates.lat.toFixed(6)}, 경도: ${coordinates.lng.toFixed(6)}`;

    try {
      await navigator.clipboard.writeText(coordText);
      toast.success("좌표가 클립보드에 복사되었습니다.");
    } catch (err) {
      toast.error("좌표 복사에 실패했습니다.");
      console.error("좌표 복사 오류:", err);
    }
  }, [coordinates]);

  // 좌표가 없는 경우 null 반환
  if (!coordinates) {
    return null;
  }

  return (
    <section className={cn("space-y-4", className)} aria-label="지도">
      <h3 className="text-xl font-semibold">위치</h3>
      <div
        className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden bg-muted"
        role="application"
        aria-label={`${detail.title} 위치 지도`}
      >
        {/* 지도 컨테이너 */}
        <div ref={mapRef} className="w-full h-full" />

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">지도를 불러오는 중...</p>
            </div>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="flex flex-col items-center gap-3 p-6 text-center max-w-md">
              <MapPin className="h-10 w-10 text-destructive" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-destructive">{error}</p>
                <p className="text-xs text-muted-foreground">
                  지도를 표시할 수 없습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                새로고침
              </Button>
            </div>
          </div>
        )}

        {/* 컨트롤 버튼들 */}
        {!isLoading && !error && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {/* 길찾기 버튼 */}
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleDirections}
              className="bg-primary text-primary-foreground shadow-md"
              aria-label={`${detail.title}로 길찾기`}
              title="네이버 지도에서 길찾기"
            >
              <Navigation className="h-4 w-4 mr-2" aria-hidden="true" />
              길찾기
            </Button>

            {/* 좌표 정보 토글 버튼 */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCoordinates(!showCoordinates)}
              className="bg-background/90 backdrop-blur-sm shadow-md"
              aria-label={showCoordinates ? "좌표 정보 숨기기" : "좌표 정보 표시하기"}
              aria-expanded={showCoordinates}
              title={showCoordinates ? "좌표 정보 숨기기" : "좌표 정보 표시하기"}
            >
              {showCoordinates ? (
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        )}

        {/* 좌표 정보 표시 */}
        {!isLoading && !error && showCoordinates && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-md border">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">좌표</p>
                  <p className="text-sm font-mono">
                    위도: {coordinates.lat.toFixed(6)}, 경도: {coordinates.lng.toFixed(6)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyCoordinates}
                  className="h-8 w-8"
                  aria-label="좌표를 클립보드에 복사"
                  title="좌표 복사"
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

