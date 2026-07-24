'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

type NavigationLoadingContextType = {
  navigatingTo: string | null;
  setNavigatingTo: (path: string | null) => void;
};

const defaultContextValue: NavigationLoadingContextType = {
  navigatingTo: null,
  setNavigatingTo: () => {},
};

const NavigationLoadingContext = createContext<NavigationLoadingContextType>(defaultContextValue);

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  const value = useMemo(
    () => ({ navigatingTo, setNavigatingTo }),
    [navigatingTo],
  );

  return (
    <NavigationLoadingContext.Provider value={value}>
      {children}
      {navigatingTo && (
        <div
          className="navigation-loading-bar fixed top-0 left-0 right-0 z-[9999] h-[3.5px] origin-left bg-primary"
          aria-hidden
        />
      )}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading(): NavigationLoadingContextType {
  return useContext(NavigationLoadingContext);
}
