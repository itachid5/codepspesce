import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about The Signal Ledger and its editorial mission.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">About us</p>
      <h1 className="mt-4 font-serif text-5xl font-black leading-none text-ink md:text-7xl">Independent-feeling technology journalism for builders.</h1>
      <div className="mt-10 grid gap-8 text-lg leading-8 text-ink/68 md:grid-cols-[1fr_0.8fr]">
        <div className="space-y-6">
          <p>The Signal Ledger covers product strategy, systems thinking, design craft, and engineering decisions with a calm editorial voice.</p>
          <p>We publish practical dispatches for teams who care about durable software, humane workflows, and thoughtful digital products.</p>
        </div>
        <aside className="rounded-[2rem] border border-ink/10 bg-sand p-6">
          <h2 className="font-serif text-2xl font-black text-ink">Our focus</h2>
          <ul className="mt-4 space-y-3 text-sm font-bold text-ink/62">
            <li>Product and engineering culture</li>
            <li>CMS and publishing workflows</li>
            <li>Design systems and interface quality</li>
            <li>Analytics, operations, and decision loops</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
