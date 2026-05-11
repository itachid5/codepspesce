import { siteName } from "@/lib/seo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div>
          <p className="font-serif text-4xl font-black">{siteName}</p>
          <p className="mt-3 max-w-xl text-paper/65">Independent-feeling technology journalism for teams who care about craft, systems, and durable product decisions.</p>
        </div>
        <div className="text-sm text-paper/60 md:text-right">Built with Next.js, Prisma, and a deliberately quiet publishing workflow.</div>
      </div>
    </footer>
  );
}
