import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">404</p>
      <h1 className="mt-4 font-serif text-6xl font-black text-ink">This signal faded.</h1>
      <p className="mt-4 text-ink/60">The page you requested does not exist or is no longer published.</p>
      <Link href="/" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-black text-paper hover:bg-rust">Return home</Link>
    </div>
  );
}
