"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function DrawerLink({
  href,
  children,
  onNavigate,
  className,
}: {
  href: string;
  children: React.ReactNode;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex min-h-12 touch-manipulation items-center rounded-2xl px-4 py-3 text-base font-black leading-snug text-ink/78 transition duration-200 hover:bg-sand hover:text-rust active:scale-[0.985] active:bg-copper/20 active:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        className,
      )}
    >
      {children}
    </Link>
  );
}
