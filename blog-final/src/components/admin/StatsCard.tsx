export function StatsCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-ink/45">{label}</p>
      <p className="mt-3 font-serif text-5xl font-black text-ink">{value}</p>
      {detail ? <p className="mt-2 text-sm text-ink/55">{detail}</p> : null}
    </div>
  );
}
