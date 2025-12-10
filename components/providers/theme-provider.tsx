/**
 * @file components/providers/theme-provider.tsx
 * @description 테마 Provider 컴포넌트
 *
 * next-themes를 사용하여 다크 모드 지원을 제공합니다.
 * 시스템 테마 감지, localStorage 저장, SSR 플리커 방지를 포함합니다.
 */

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

