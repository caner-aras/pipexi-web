"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname();
  
  const isPublicRoute = 
    pathname === "/" || 
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/onboarding");

  return (
    <NextThemesProvider 
      {...props} 
      forcedTheme={isPublicRoute ? "light" : undefined}
    >
      {children}
    </NextThemesProvider>
  );
}
