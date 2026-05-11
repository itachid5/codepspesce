"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { siteName } from "@/lib/seo";
import { CategoryLinks } from "./CategoryLinks";
import { DrawerLink } from "./DrawerLink";
import { DrawerSection } from "./DrawerSection";
import { MenuButton } from "./MenuButton";
import { TagLinks } from "./TagLinks";

type TaxonomyLink = { id: string; name: string; slug: string; _count?: { posts: number } };
type DrawerPost = { id: string; title: string; slug: string; viewCount?: number };
type RecentPost = { title: string; slug: string };

const focusSelector = "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])";

function readRecentlyViewed() {
  try {
    const items = JSON.parse(localStorage.getItem("recentlyViewedPosts") ?? "[]");
    return Array.isArray(items) ? (items as RecentPost[]) : [];
  } catch {
    return [];
  }
}

function LinkIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="mr-3 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sand text-sm font-black text-rust" aria-hidden="true">
      {children}
    </span>
  );
}

export function SiteDrawer({
  categories,
  tags,
  featuredPosts,
  popularPosts,
  isAdmin,
}: {
  categories: TaxonomyLink[];
  tags: TaxonomyLink[];
  featuredPosts: DrawerPost[];
  popularPosts: DrawerPost[];
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentPost[]>([]);
  const drawerId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function openDrawer() {
    setRecentlyViewed(readRecentlyViewed());
    setOpen(true);
  }

  const closeDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const returnFocusTarget = menuButtonRef.current;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(focusSelector)?.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
        return;
      }

      if (event.key !== "Tab") return;

      const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(focusSelector) ?? []);
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollY);
      document.removeEventListener("keydown", onKeyDown);
      returnFocusTarget?.focus();
    };
  }, [closeDrawer, open]);

  const drawerLayer = (
    <>
      <button
        type="button"
        aria-label="Close site menu overlay"
        onClick={closeDrawer}
        className="fixed inset-0 z-[90] bg-ink/70 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:duration-0"
      />
      <aside
        id={drawerId}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation menu"
        className="fixed inset-y-0 left-0 z-[100] flex h-dvh w-[85vw] max-w-[26rem] flex-col overflow-hidden border-r border-ink/10 bg-paper shadow-2xl shadow-ink/35 transition-transform duration-300 ease-out motion-reduce:duration-0"
      >
        <div className="flex min-h-20 items-center justify-between gap-3 border-b border-ink/10 bg-paper px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="truncate font-serif text-2xl font-black text-ink">{siteName}</p>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-rust">Navigation</p>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close site menu"
            className="inline-flex h-12 w-12 shrink-0 touch-manipulation items-center justify-center rounded-2xl border border-ink/15 bg-paper text-3xl leading-none text-ink transition hover:border-rust hover:text-rust active:scale-95 active:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <nav className="flex-1 space-y-8 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-6 sm:px-5" aria-label="Mobile site navigation">
          <DrawerSection title="Main Menu">
            <DrawerLink href="/" onNavigate={closeDrawer}><LinkIcon>H</LinkIcon>Home</DrawerLink>
          </DrawerSection>

          <DrawerSection title="Blog">
            <DrawerLink href="/posts" onNavigate={closeDrawer}><LinkIcon>A</LinkIcon>All Posts</DrawerLink>
            <DrawerLink href="/trending" onNavigate={closeDrawer}><LinkIcon>T</LinkIcon>Trending Posts</DrawerLink>
            <DrawerLink href="/posts" onNavigate={closeDrawer}><LinkIcon>L</LinkIcon>Latest Posts</DrawerLink>
            <DrawerLink href="/categories" onNavigate={closeDrawer}><LinkIcon>C</LinkIcon>Categories</DrawerLink>
            <DrawerLink href="/tags" onNavigate={closeDrawer}><LinkIcon>#</LinkIcon>Tags</DrawerLink>
            <DrawerLink href="/search" onNavigate={closeDrawer}><LinkIcon>S</LinkIcon>Search</DrawerLink>
          </DrawerSection>

          <DrawerSection title="Pages">
            <DrawerLink href="/about" onNavigate={closeDrawer}><LinkIcon>i</LinkIcon>About Us</DrawerLink>
            <DrawerLink href="/privacy-policy" onNavigate={closeDrawer}><LinkIcon>P</LinkIcon>Privacy Policy</DrawerLink>
            <DrawerLink href="/terms-and-conditions" onNavigate={closeDrawer}><LinkIcon>§</LinkIcon>Terms and Conditions</DrawerLink>
            <DrawerLink href="/contact" onNavigate={closeDrawer}><LinkIcon>@</LinkIcon>Contact Us</DrawerLink>
          </DrawerSection>

          <DrawerSection title="Admin">
            <DrawerLink href="/admin/login" onNavigate={closeDrawer}><LinkIcon>↗</LinkIcon>Admin Login</DrawerLink>
            {isAdmin ? <DrawerLink href="/admin" onNavigate={closeDrawer}><LinkIcon>D</LinkIcon>Admin Dashboard</DrawerLink> : null}
          </DrawerSection>

          <DrawerSection title="Categories">
            <CategoryLinks categories={categories} onNavigate={closeDrawer} />
          </DrawerSection>

          <DrawerSection title="Tags">
            <TagLinks tags={tags} onNavigate={closeDrawer} />
          </DrawerSection>

          <DrawerSection title="Popular Reads">
            {featuredPosts.slice(0, 3).map((post) => <DrawerLink key={post.id} href={`/posts/${post.slug}`} onNavigate={closeDrawer}>{post.title}</DrawerLink>)}
            {popularPosts.slice(0, 3).map((post) => <DrawerLink key={post.id} href={`/posts/${post.slug}`} onNavigate={closeDrawer}>{post.title}</DrawerLink>)}
            {recentlyViewed.length ? recentlyViewed.map((post) => <DrawerLink key={post.slug} href={`/posts/${post.slug}`} onNavigate={closeDrawer}>Recently viewed: {post.title}</DrawerLink>) : <p className="px-4 py-2 text-sm font-bold text-ink/45">Recently viewed posts will appear here.</p>}
          </DrawerSection>
        </nav>
      </aside>
    </>
  );

  return (
    <div className="shrink-0">
      <MenuButton ref={menuButtonRef} onClick={openDrawer} expanded={open} controlsId={drawerId} />
      {mounted && open ? createPortal(drawerLayer, document.body) : null}
    </div>
  );
}
