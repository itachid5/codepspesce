"use client";

export function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="px-4 text-[0.68rem] font-black uppercase tracking-[0.28em] text-ink/45">{title}</h2>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}
