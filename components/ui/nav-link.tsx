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
  const isLoading = path && path !== '#' && navigatingTo === path;

  return (
    <Link
      href={href}
      className={cn('flex items-center gap-2', className)}
      onClick={(e) => {
        if (path && path !== '#') setNavigatingTo(path);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
      {isLoading && (
        <Loader2
          className="size-4 shrink-0 animate-spin text-muted-foreground"
          aria-hidden
        />
      )}
    </Link>
  );
}
