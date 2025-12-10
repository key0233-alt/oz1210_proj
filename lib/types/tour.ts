/**
 * @file lib/types/tour.ts
 * @description 관광지 관련 TypeScript 타입 정의
 *
 * 한국관광공사 API 응답 데이터 구조를 기반으로 작성되었습니다.
 */

/**
 * 관광지 목록 항목 (areaBasedList2, searchKeyword2 응답)
 */
export interface TourItem {
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 지역코드 */
  areacode: string;
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 제목 (관광지명) */
  title: string;
  /** 경도 (KATEC 좌표계, 정수형) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형) */
  mapy: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 전화번호 */
  tel?: string;
  /** 대분류 */
  cat1?: string;
  /** 중분류 */
  cat2?: string;
  /** 소분류 */
  cat3?: string;
  /** 수정일 */
  modifiedtime: string;
}

/**
 * 관광지 상세 정보 (detailCommon2 응답)
 */
export interface TourDetail extends TourItem {
  /** 우편번호 */
  zipcode?: string;
  /** 홈페이지 */
  homepage?: string;
  /** 개요 (긴 설명) */
  overview?: string;
}

/**
 * 관광지 운영 정보 (detailIntro2 응답)
 * 타입별로 필드가 다르므로 선택적 필드로 정의
 */
export interface TourIntro {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 이용시간/운영시간 */
  usetime?: string;
  /** 휴무일 */
  restdate?: string;
  /** 문의처 */
  infocenter?: string;
  /** 주차 가능 여부 */
  parking?: string;
  /** 반려동물 동반 가능 여부 */
  chkpet?: string;
  /** 수용인원 */
  accomcount?: string;
  /** 체험 프로그램 */
  expguide?: string;
  /** 유모차 대여 */
  babycarriage?: string;
  /** 애완동물 동반 */
  pet?: string;
  /** 체험가능연령 */
  expagerange?: string;
  /** 이용요금 */
  usefee?: string;
  /** 주차요금 */
  parkingfee?: string;
  /** 할인정보 */
  discountinfo?: string;
  /** 예약안내 */
  reservation?: string;
  /** 취소/환불 안내 */
  refund?: string;
}

/**
 * 관광지 이미지 정보 (detailImage2 응답)
 */
export interface TourImage {
  /** 콘텐츠ID */
  contentid: string;
  /** 원본 이미지 URL */
  originimgurl: string;
  /** 썸네일 이미지 URL */
  smallimageurl: string;
  /** 이미지명 */
  imgname?: string;
}

/**
 * 반려동물 동반 여행 정보 (detailPetTour2 응답)
 */
export interface PetTourInfo {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 애완동물 목줄 착용 여부 */
  chkpetleash?: string;
  /** 애완동물 크기 제한 */
  chkpetsize?: string;
  /** 입장 가능 장소 (실내/실외) */
  chkpetplace?: string;
  /** 추가 요금 */
  chkpetfee?: string;
  /** 기타 반려동물 정보 */
  petinfo?: string;
  /** 주차장 정보 */
  parking?: string;
}

