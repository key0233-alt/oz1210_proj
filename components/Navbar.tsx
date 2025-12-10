/**
 * @file components/Navbar.tsx
 * @description 네비게이션 바 컴포넌트
 *
 * 로고, 검색창, 네비게이션 링크, 로그인 버튼을 포함합니다.
 * 반응형 디자인을 지원하며 모바일에서는 햄버거 메뉴를 표시합니다.
 */

"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { href: "/", label: "홈" },
    { href: "/stats", label: "통계" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold">My Trip</span>
        </Link>

        {/* 데스크톱 네비게이션 및 검색 */}
        <div className="hidden md:flex md:items-center md:gap-4 md:flex-1 md:justify-center">
          {/* 네비게이션 링크 */}
          <nav aria-label="주요 네비게이션" className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-primary"
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <SignedIn>
              <Link
                href="/bookmarks"
                className="text-sm font-medium transition-colors hover:text-primary"
                aria-current={pathname === "/bookmarks" ? "page" : undefined}
              >
                북마크
              </Link>
            </SignedIn>
          </nav>

          {/* 검색창 */}
          <form onSubmit={handleSearch} className="flex items-center gap-2" role="search">
            <label htmlFor="desktop-search" className="sr-only">
              관광지 검색
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="desktop-search"
                type="search"
                placeholder="관광지 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px] pl-9"
                aria-label="관광지 검색"
              />
            </div>
          </form>
        </div>

        {/* 데스크톱 로그인 버튼 */}
        <div className="hidden md:flex md:items-center md:gap-4">
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                로그인
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        {/* 모바일 메뉴 버튼 */}
        <div className="flex md:hidden items-center gap-2">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="메뉴 열기/닫기"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* 모바일 검색창 */}
            <form onSubmit={handleSearch} className="flex items-center gap-2" role="search">
              <label htmlFor="mobile-search" className="sr-only">
                관광지 검색
              </label>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="mobile-search"
                  type="search"
                  placeholder="관광지 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  aria-label="관광지 검색"
                />
              </div>
            </form>

            {/* 모바일 네비게이션 링크 */}
            <nav aria-label="주요 네비게이션" className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium transition-colors hover:bg-accent rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
              <SignedIn>
                <Link
                  href="/bookmarks"
                  className="px-3 py-2 text-sm font-medium transition-colors hover:bg-accent rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={pathname === "/bookmarks" ? "page" : undefined}
                >
                  북마크
                </Link>
              </SignedIn>
              <div className="px-3 py-2">
                <ThemeToggle />
              </div>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    로그인
                  </Button>
                </SignInButton>
              </SignedOut>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
