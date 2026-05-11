import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms for using The Signal Ledger website.",
};

export default function TermsAndConditionsPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">Terms and conditions</p>
      <h1 className="mt-4 font-serif text-5xl font-black text-ink md:text-7xl">Use the site with care and respect.</h1>
      <div className="mt-10 space-y-8 rounded-[2rem] border border-ink/10 bg-white p-6 text-base leading-8 text-ink/68 shadow-sm md:p-10">
        <section><h2 className="font-serif text-2xl font-black text-ink">Content</h2><p className="mt-3">Articles are provided for informational purposes. They should not be treated as legal, financial, or professional advice.</p></section>
        <section><h2 className="font-serif text-2xl font-black text-ink">Acceptable use</h2><p className="mt-3">Do not interfere with the site, attempt unauthorized admin access, scrape aggressively, or misuse forms and public endpoints.</p></section>
        <section><h2 className="font-serif text-2xl font-black text-ink">Ownership</h2><p className="mt-3">Site design, article content, and branding belong to their respective owners unless otherwise stated.</p></section>
        <section><h2 className="font-serif text-2xl font-black text-ink">Changes</h2><p className="mt-3">These terms may be updated as the publishing platform evolves.</p></section>
      </div>
    </main>
  );
}
