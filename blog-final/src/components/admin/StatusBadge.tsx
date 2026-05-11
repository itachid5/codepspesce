export function StatusBadge({ status }: { status: string }) {
  const published = status === "published";
  return <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{status}</span>;
}
