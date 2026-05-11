import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("w-full rounded-2xl border border-ink/15 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-rust focus:ring-2 focus:ring-rust/20", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("min-h-36 w-full rounded-2xl border border-ink/15 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-rust focus:ring-2 focus:ring-rust/20", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("w-full rounded-2xl border border-ink/15 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-rust focus:ring-2 focus:ring-rust/20", props.className)} />;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-ink/55">{children}</label>;
}
