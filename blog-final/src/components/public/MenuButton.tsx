"use client";

import { forwardRef } from "react";

type MenuButtonProps = {
  onClick: () => void;
  expanded: boolean;
  controlsId: string;
};

export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(function MenuButton({ onClick, expanded, controlsId }, ref) {
  function handleClick() {
    console.log("site drawer menu button tapped");
    onClick();
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      aria-label={expanded ? "Close site menu" : "Open site menu"}
      aria-expanded={expanded}
      aria-controls={controlsId}
      className="group relative z-50 inline-flex h-12 w-12 shrink-0 touch-manipulation items-center justify-center rounded-2xl border border-ink/15 bg-paper text-ink shadow-sm shadow-ink/5 transition duration-200 pointer-events-auto hover:border-rust hover:text-rust active:scale-95 active:border-rust active:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2 focus-visible:ring-offset-paper md:h-11 md:w-11"
    >
      <span className="absolute inset-1 rounded-[0.85rem] bg-copper/0 transition group-active:bg-copper/15" aria-hidden="true" />
      <span className="relative flex w-5 flex-col gap-1.5" aria-hidden="true">
        <span className="h-0.5 w-5 rounded-full bg-current transition group-hover:w-4" />
        <span className="h-0.5 w-5 rounded-full bg-current" />
        <span className="ml-auto h-0.5 w-4 rounded-full bg-current transition group-hover:w-5" />
      </span>
    </button>
  );
});
