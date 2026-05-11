"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="rounded-full bg-ink px-6 py-3 text-sm font-black text-paper transition hover:bg-rust disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Saving..." : children}</button>;
}
