import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy practices for The Signal Ledger.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">Privacy policy</p>
      <h1 className="mt-4 font-serif text-5xl font-black text-ink md:text-7xl">Privacy, plainly stated.</h1>
      <div className="mt-10 space-y-8 rounded-[2rem] border border-ink/10 bg-white p-6 text-base leading-8 text-ink/68 shadow-sm md:p-10">
        <section><h2 className="font-serif text-2xl font-black text-ink">Information we collect</h2><p className="mt-3">We may collect basic usage information such as page views, browser details, and approximate request metadata to improve the site and measure article performance.</p></section>
        <section><h2 className="font-serif text-2xl font-black text-ink">Cookies</h2><p className="mt-3">The site may use cookies for admin authentication and lightweight view-count deduplication. Admin cookies are HTTP-only and used only for protected publishing workflows.</p></section>
        <section><h2 className="font-serif text-2xl font-black text-ink">Media and third parties</h2><p className="mt-3">Images may be served from external media providers. Uploaded media is routed through the configured Media API rather than exposing storage credentials in the browser.</p></section>
        <section><h2 className="font-serif text-2xl font-black text-ink">Contact</h2><p className="mt-3">For privacy questions, use the contact page to reach the site operator.</p></section>
      </div>
    </main>
  );
}
