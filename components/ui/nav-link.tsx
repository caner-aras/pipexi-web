'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigationLoading } from '@/providers/navigation-loading-provider';
import { cn } from '@/lib/utils';

function getPath(href: ComponentProps<typeof Link>['href']): string {
  if (typeof href === 'string') return href;
  if (href && typeof href === 'object' && 'pathname' in href) return href.pathname ?? '';
  return '';
}

export function NavLink({
  href,
  children,
  className,
  onClick,
  ...props
}: ComponentProps<typeof Link>) {
  const path = getPath(href);
  const { navigatingTo, setNavigatingTo } = useNavigationLoading();
  const isLoading = Boolean(path && path !== '#' && navigatingTo === path);

  return (
    <Link
      href={href}
      className={cn('relative inline-flex items-center gap-2', className)}
      aria-busy={isLoading || undefined}
      onClick={(e) => {
        if (path && path !== '#') setNavigatingTo(path);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
      {isLoading ? (
        <Loader2
          className="pointer-events-none absolute top-1/2 left-[calc(100%+0.375rem)] size-3.5 shrink-0 -translate-y-1/2 animate-spin text-muted-foreground"
          aria-hidden
        />
      ) : null}
    </Link>
  );
}
