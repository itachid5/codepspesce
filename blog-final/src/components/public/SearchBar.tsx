import { Input } from "@/components/ui/Field";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/search" className="flex flex-col gap-3 rounded-[2rem] border border-ink/10 bg-white p-3 shadow-sm md:flex-row">
      <Input name="q" defaultValue={defaultValue} placeholder="Search reporting, categories, tags..." className="border-0 bg-transparent md:text-lg" />
      <button className="rounded-full bg-rust px-7 py-3 text-sm font-black text-white transition hover:bg-ink">Search</button>
    </form>
  );
}
