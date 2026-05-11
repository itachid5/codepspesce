import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact The Signal Ledger editorial desk.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">Contact us</p>
      <h1 className="mt-4 font-serif text-5xl font-black leading-none text-ink md:text-7xl">Send a note to the editorial desk.</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-serif text-2xl font-black text-ink">Editorial inquiries</h2>
          <p className="mt-4 leading-8 text-ink/65">For pitches, corrections, partnerships, and reader feedback, contact the operator configured for this deployment.</p>
          <div className="mt-6"><LinkButton href="mailto:hello@example.com">Email hello@example.com</LinkButton></div>
        </section>
        <section className="rounded-[2rem] border border-ink/10 bg-sand p-6 md:p-8">
          <h2 className="font-serif text-2xl font-black text-ink">What to include</h2>
          <ul className="mt-4 space-y-3 text-sm font-bold leading-7 text-ink/62">
            <li>Your name and organization</li>
            <li>The article or topic you are referencing</li>
            <li>A concise summary of the request</li>
            <li>Any relevant links or context</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
