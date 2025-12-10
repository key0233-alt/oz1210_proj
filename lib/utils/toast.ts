/**
 * @file lib/utils/toast.ts
 * @description 토스트 알림 유틸리티 함수
 *
 * sonner를 사용한 토스트 알림 헬퍼 함수들을 제공합니다.
 */

import { toast as sonnerToast } from "sonner";

/**
 * 성공 토스트 표시
 */
export function toastSuccess(message: string, description?: string) {
  return sonnerToast.success(message, {
    description,
    duration: 3000,
  });
}

/**
 * 에러 토스트 표시
 */
export function toastError(message: string, description?: string) {
  return sonnerToast.error(message, {
    description,
    duration: 5000,
  });
}

/**
 * 정보 토스트 표시
 */
export function toastInfo(message: string, description?: string) {
  return sonnerToast.info(message, {
    description,
    duration: 3000,
  });
}

/**
 * 경고 토스트 표시
 */
export function toastWarning(message: string, description?: string) {
  return sonnerToast.warning(message, {
    description,
    duration: 4000,
  });
}

/**
 * 로딩 토스트 표시 (Promise와 함께 사용)
 */
export function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) {
  return sonnerToast.promise(promise, messages);
}

/**
 * 기본 토스트 객체 (직접 사용 가능)
 */
export const toast = {
  success: toastSuccess,
  error: toastError,
  info: toastInfo,
  warning: toastWarning,
  promise: toastPromise,
  ...sonnerToast, // sonner의 다른 메서드들도 사용 가능
};

