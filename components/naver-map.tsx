/**
 * @file components/naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * Naver Maps API v3 (NCP)를 사용하여 관광지 목록을 지도에 마커로 표시합니다.
 * 리스트와 지도를 양방향으로 연동하여 사용자 경험을 향상시킵니다.
 *
 * 주요 기능:
 * 1. 네이버 지도 API 스크립트 동적 로드
 * 2. 관광지 목록을 마커로 표시
 * 3. 마커 클릭 시 인포윈도우 표시
 * 4. 지도-리스트 양방향 연동
 * 5. 지도 컨트롤 (줌, 지도 유형 선택)
 *
 * @dependencies
 * - naver.maps: 네이버 지도 API (동적 로드)
 * - lib/utils/coordinates: 좌표 변환 유틸리티
 * - lib/constants/map: 지도 관련 상수
 */

"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TourItem } from "@/lib/types/tour";
import { katecToWgs84 } from "@/lib/utils/coordinates";
import { getRegionCenter, getRegionZoom } from "@/lib/constants/map";
import { getEnv } from "@/lib/env";
import { cn } from "@/lib/utils";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

// Naver Maps API 타입 정의
declare global {
  interface Window {
    naver?: typeof naver;
  }
}

interface NaverMapProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 선택된 관광지 ID (리스트에서 선택된 항목) */
  selectedContentId?: string;
  /** 마커 클릭 시 콜백 */
  onMarkerClick?: (contentId: string) => void;
  /** 초기 중심 좌표를 위한 지역 코드 */
  areaCode?: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 네이버 지도 스크립트 로드 상태
 */
let scriptLoadPromise: Promise<void> | null = null;

/**
 * 네이버 지도 API 스크립트 동적 로드
 * 중복 로드를 방지하기 위해 Promise를 캐싱합니다.
 */
function loadNaverMapsScript(): Promise<void> {
  // 이미 로드 중이거나 로드 완료된 경우
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  // 이미 스크립트가 로드된 경우
  if (typeof window !== "undefined" && window.naver?.maps) {
    scriptLoadPromise = Promise.resolve();
    return scriptLoadPromise;
  }

  // 스크립트 로드
  scriptLoadPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not defined"));
      return;
    }

    const clientId = getEnv("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID");
    const scriptId = "naver-maps-script";
    
    // 이미 스크립트가 존재하는 경우
    if (document.getElementById(scriptId)) {
      // 스크립트 로드 완료 대기
      const checkNaver = setInterval(() => {
        if (window.naver?.maps) {
          clearInterval(checkNaver);
          resolve();
        }
      }, 100);
      
      // 타임아웃 (10초)
      setTimeout(() => {
        clearInterval(checkNaver);
        if (!window.naver?.maps) {
          reject(new Error("네이버 지도 API 로드 타임아웃"));
        }
      }, 10000);
      return;
    }

    // 스크립트 생성 및 추가
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // 네이버 지도 API가 로드될 때까지 대기
      const checkNaver = setInterval(() => {
        if (window.naver?.maps) {
          clearInterval(checkNaver);
          resolve();
        }
      }, 100);

      // 타임아웃 (10초)
      setTimeout(() => {
        clearInterval(checkNaver);
        if (!window.naver?.maps) {
          reject(new Error("네이버 지도 API 로드 타임아웃"));
        }
      }, 10000);
    };

    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error("네이버 지도 API 스크립트 로드 실패"));
    };

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * 네이버 지도 컴포넌트
 */
export function NaverMap({
  tours,
  selectedContentId,
  onMarkerClick,
  areaCode,
  className,
}: NaverMapProps) {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<"normal" | "satellite">("normal");

  // 관광지 좌표 변환 및 필터링
  const tourCoordinates = useMemo(() => {
    return tours
      .map((tour) => {
        try {
          const coords = katecToWgs84(tour.mapx, tour.mapy);
          return {
            tour,
            coords,
          };
        } catch {
          // 좌표 변환 실패 시 제외
          return null;
        }
      })
      .filter((item): item is { tour: TourItem; coords: { lng: number; lat: number } } => item !== null);
  }, [tours]);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current) return;

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

        // 초기 중심 좌표 설정
        const center = getRegionCenter(areaCode);
        const zoom = getRegionZoom(areaCode);

        // 지도 생성
        const map = new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(center.lat, center.lng),
          zoom,
          mapTypeControl: false, // 기본 컨트롤 비활성화 (커스텀 컨트롤 사용)
        });

        mapInstanceRef.current = map;
        setIsLoading(false);

        // 지도 타입 설정
        map.setMapTypeId(
          mapType === "satellite"
            ? window.naver.maps.MapTypeId.SATELLITE
            : window.naver.maps.MapTypeId.NORMAL
        );
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
  }, [areaCode, mapType]);

  // 마커 생성 및 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) return;

    const map = mapInstanceRef.current;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // 인포윈도우 닫기
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }

    // 새 마커 생성
    tourCoordinates.forEach(({ tour, coords }) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(coords.lat, coords.lng),
        map,
        title: tour.title,
        icon: {
          content: `
            <div style="
              width: 32px;
              height: 32px;
              background-color: #3b82f6;
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <div style="
                width: 12px;
                height: 12px;
                background-color: white;
                border-radius: 50%;
              "></div>
            </div>
          `,
          anchor: new window.naver.maps.Point(16, 16),
        },
      });

      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(marker, "click", () => {
        // 인포윈도우 생성 및 표시
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
            ">${tour.title}</h3>
            <p style="
              margin: 0 0 12px 0;
              font-size: 14px;
              color: #6b7280;
            ">${tour.addr1}</p>
            <button
              id="info-window-button-${tour.contentid}"
              style="
                width: 100%;
                padding: 8px 16px;
                background-color: #3b82f6;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
              "
              onmouseover="this.style.backgroundColor='#2563eb'"
              onmouseout="this.style.backgroundColor='#3b82f6'"
            >
              상세보기
            </button>
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

        // 상세보기 버튼 클릭 이벤트 (인포윈도우가 DOM에 추가된 후)
        setTimeout(() => {
          const button = document.getElementById(
            `info-window-button-${tour.contentid}`
          );
          if (button) {
            button.addEventListener("click", () => {
              router.push(`/places/${tour.contentid}`);
            });
          }
        }, 100);

        // 마커 클릭 콜백 호출
        if (onMarkerClick) {
          onMarkerClick(tour.contentid);
        }
      });

      markersRef.current.push(marker);
    });
  }, [tourCoordinates, router, onMarkerClick]);

  // 선택된 관광지로 지도 이동
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedContentId) return;

    const selectedTour = tourCoordinates.find(
      (item) => item.tour.contentid === selectedContentId
    );

    if (selectedTour) {
      const map = mapInstanceRef.current;
      const position = new window.naver.maps.LatLng(
        selectedTour.coords.lat,
        selectedTour.coords.lng
      );

      // 지도 이동 (애니메이션)
      map.panTo(position);

      // 해당 마커의 인포윈도우 표시
      const marker = markersRef.current.find(
        (m) =>
          m.getPosition().lat() === selectedTour.coords.lat &&
          m.getPosition().lng() === selectedTour.coords.lng
      );

      if (marker && window.naver?.maps) {
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
            ">${selectedTour.tour.title}</h3>
            <p style="
              margin: 0 0 12px 0;
              font-size: 14px;
              color: #6b7280;
            ">${selectedTour.tour.addr1}</p>
            <button
              id="info-window-button-${selectedTour.tour.contentid}"
              style="
                width: 100%;
                padding: 8px 16px;
                background-color: #3b82f6;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
              "
              onmouseover="this.style.backgroundColor='#2563eb'"
              onmouseout="this.style.backgroundColor='#3b82f6'"
            >
              상세보기
            </button>
          </div>
        `;

        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }

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

        setTimeout(() => {
          const button = document.getElementById(
            `info-window-button-${selectedTour.tour.contentid}`
          );
          if (button) {
            button.addEventListener("click", () => {
              router.push(`/places/${selectedTour.tour.contentid}`);
            });
          }
        }, 100);
      }
    }
  }, [selectedContentId, tourCoordinates, router]);

  // 지도 타입 전환 핸들러
  const handleMapTypeToggle = useCallback(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) return;

    const newMapType = mapType === "normal" ? "satellite" : "normal";
    setMapType(newMapType);

    mapInstanceRef.current.setMapTypeId(
      newMapType === "satellite"
        ? window.naver.maps.MapTypeId.SATELLITE
        : window.naver.maps.MapTypeId.NORMAL
    );
  }, [mapType]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 마커 제거
      markersRef.current.forEach((marker) => {
        marker.setMap(null);
      });
      markersRef.current = [];

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

  return (
    <div className={cn("relative w-full h-full min-h-[400px] lg:min-h-[600px]", className)}>
      {/* 지도 컨테이너 */}
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">지도를 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <MapPin className="h-8 w-8 text-destructive" />
            <p className="text-sm font-medium text-destructive">{error}</p>
            <p className="text-xs text-muted-foreground">
              환경변수 NEXT_PUBLIC_NAVER_MAP_CLIENT_ID를 확인해주세요.
            </p>
          </div>
        </div>
      )}

      {/* 지도 컨트롤 */}
      {!isLoading && !error && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          {/* 지도 유형 선택 버튼 */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMapTypeToggle}
            className="bg-background/90 backdrop-blur-sm shadow-md"
          >
            {mapType === "normal" ? "위성" : "일반"}
          </Button>
        </div>
      )}
    </div>
  );
}

